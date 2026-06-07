package com.hrapp.leaverequest;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaveapproval.LeaveApprovalService;
import com.hrapp.leavebalance.LeaveBalance;
import com.hrapp.leavebalance.LeaveBalanceService;
import com.hrapp.leaverequest.dto.ApproveRejectRequest;
import com.hrapp.leaverequest.dto.CreateLeaveRequestRequest;
import com.hrapp.leaverequest.dto.LeaveRequestResponse;
import com.hrapp.leaverequest.dto.TeamLeaveEntry;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeService;
import com.hrapp.notification.LeaveNotificationService;
import com.hrapp.push.DeviceTokenService;
import com.hrapp.push.FcmService;
import com.hrapp.user.User;
import com.hrapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeService leaveTypeService;
    private final LeaveBalanceService leaveBalanceService;
    private final LeaveApprovalService leaveApprovalService;
    private final BusinessDayCalculator businessDayCalculator;
    private final LeaveNotificationService notificationService;
    private final DeviceTokenService deviceTokenService;
    private final FcmService fcmService;
    private final UserRepository userRepository;

    @Transactional
    public LeaveRequestResponse submit(CreateLeaveRequestRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();

        Employee employee = employeeRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new BusinessException("NO_EMPLOYEE_PROFILE",
                        "No employee profile found. Please contact HR."));

        LeaveType leaveType = leaveTypeService.findByIdAndCompanyId(request.leaveTypeId(), companyId);
        if (!leaveType.isActive()) {
            throw new BusinessException("INACTIVE_LEAVE_TYPE", "This leave type is no longer available");
        }

        LocalDate today = LocalDate.now();
        if (request.startDate().isBefore(today)) {
            throw new BusinessException("PAST_DATE", "Cannot book leave starting in the past");
        }
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessException("INVALID_DATE_RANGE", "End date must be on or after start date");
        }

        BigDecimal workingDays = businessDayCalculator.calculate(companyId, request.startDate(), request.endDate());
        if (workingDays.compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessException("NO_WORKING_DAYS", "The selected dates contain no working days");
        }

        // Check balance if leave type requires it (not sick leave or unpaid with NONE accrual)
        int year = request.startDate().getYear();
        LeaveBalance balance = leaveBalanceService.getOrCreateBalance(employee.getId(), leaveType.getId(), companyId, year);
        if (balance.remainingDays().compareTo(workingDays) < 0) {
            throw new BusinessException("INSUFFICIENT_BALANCE",
                    "Insufficient leave balance. Available: " + balance.remainingDays() + " days");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setCompanyId(companyId);
        leaveRequest.setEmployeeId(employee.getId());
        leaveRequest.setLeaveTypeId(leaveType.getId());
        leaveRequest.setStartDate(request.startDate());
        leaveRequest.setEndDate(request.endDate());
        leaveRequest.setWorkingDays(workingDays);
        leaveRequest.setReason(request.reason());

        if (!leaveType.isRequiresApproval()) {
            leaveRequest.setStatus(LeaveStatus.APPROVED);
            LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
            leaveBalanceService.deductBalance(employee.getId(), leaveType.getId(), companyId, workingDays);
            return toResponse(saved, employee, leaveType);
        }

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        leaveApprovalService.createApprovalStepsForRequest(saved);

        fireLeaveSubmittedNotification(employee, leaveType, saved, request.reason(), companyId);

        return toResponse(saved, employee, leaveType);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getMyRequests() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee employee = employeeRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("No employee profile found"));
        return buildResponseList(
                leaveRequestRepository.findByEmployeeIdAndCompanyIdOrderByCreatedAtDesc(employee.getId(), companyId),
                companyId);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getPendingForManager() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        String role = getCurrentRole();

        if ("HR_ADMIN".equals(role)) {
            // HR Admin sees all pending requests
            List<Employee> allActive = employeeRepository.findAll().stream()
                    .filter(e -> e.getCompanyId().equals(companyId) && "ACTIVE".equals(e.getEmploymentStatus()))
                    .toList();
            List<UUID> ids = allActive.stream().map(Employee::getId).toList();
            if (ids.isEmpty()) return List.of();
            return buildResponseList(leaveRequestRepository.findPendingByEmployeeIds(companyId, ids), companyId);
        }

        Employee manager = employeeRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new BusinessException("NO_EMPLOYEE_PROFILE", "No employee profile found"));
        List<Employee> reports = employeeRepository.findDirectReports(companyId, manager.getId());
        if (reports.isEmpty()) return List.of();
        List<UUID> reportIds = reports.stream().map(Employee::getId).toList();
        return buildResponseList(leaveRequestRepository.findPendingByEmployeeIds(companyId, reportIds), companyId);
    }

    @Transactional(readOnly = true)
    public List<TeamLeaveEntry> getTeamCalendar(LocalDate from, LocalDate to) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        String role = getCurrentRole();

        List<UUID> teamIds;
        if ("HR_ADMIN".equals(role)) {
            teamIds = employeeRepository.findAll().stream()
                    .filter(e -> e.getCompanyId().equals(companyId))
                    .map(Employee::getId).toList();
        } else {
            Employee manager = employeeRepository.findByUserIdAndCompanyId(userId, companyId).orElse(null);
            if (manager == null) return List.of();
            teamIds = employeeRepository.findDirectReports(companyId, manager.getId())
                    .stream().map(Employee::getId).toList();
        }
        if (teamIds.isEmpty()) return List.of();

        Map<UUID, String> employeeNames = employeeRepository.findAll().stream()
                .filter(e -> teamIds.contains(e.getId()))
                .collect(Collectors.toMap(Employee::getId,
                        e -> e.getFirstName() + " " + e.getLastName()));
        Map<UUID, String> typeNames = leaveTypeService.findActiveByCompanyId(companyId)
                .stream().collect(Collectors.toMap(LeaveType::getId, LeaveType::getName));

        return leaveRequestRepository.findApprovedTeamLeave(companyId, teamIds, from, to).stream()
                .map(lr -> new TeamLeaveEntry(
                        lr.getId(), lr.getEmployeeId(),
                        employeeNames.getOrDefault(lr.getEmployeeId(), "Unknown"),
                        typeNames.getOrDefault(lr.getLeaveTypeId(), "Unknown"),
                        lr.getStartDate(), lr.getEndDate()))
                .toList();
    }

    @Transactional
    public LeaveRequestResponse approve(UUID id, ApproveRejectRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        String role = getCurrentRole();

        LeaveRequest lr = findOwned(id, companyId);
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "Only pending leave requests can be approved");
        }

        verifyApproverAuthorization(lr, userId, role, companyId);

        boolean fullyApproved = leaveApprovalService.processApproval(id, userId, request.comment(), true);

        if (fullyApproved) {
            lr.setStatus(LeaveStatus.APPROVED);
            lr.setUpdatedAt(Instant.now());
            leaveRequestRepository.save(lr);
            leaveBalanceService.deductBalance(lr.getEmployeeId(), lr.getLeaveTypeId(), companyId, lr.getWorkingDays());
            fireLeaveApprovedNotification(lr, companyId);
        }

        LeaveType lt = leaveTypeService.findByIdAndCompanyId(lr.getLeaveTypeId(), companyId);
        Employee emp = employeeRepository.findByIdAndCompanyId(lr.getEmployeeId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return toResponse(lr, emp, lt);
    }

    @Transactional
    public LeaveRequestResponse reject(UUID id, ApproveRejectRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        String role = getCurrentRole();

        if (request.comment() == null || request.comment().isBlank()) {
            throw new BusinessException("REASON_REQUIRED", "A rejection reason is required");
        }

        LeaveRequest lr = findOwned(id, companyId);
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "Only pending leave requests can be rejected");
        }

        verifyApproverAuthorization(lr, userId, role, companyId);

        leaveApprovalService.processApproval(id, userId, request.comment(), false);
        lr.setStatus(LeaveStatus.REJECTED);
        lr.setRejectionReason(request.comment());
        lr.setUpdatedAt(Instant.now());
        leaveRequestRepository.save(lr);

        fireLeaveRejectedNotification(lr, request.comment(), companyId);

        LeaveType lt = leaveTypeService.findByIdAndCompanyId(lr.getLeaveTypeId(), companyId);
        Employee emp = employeeRepository.findByIdAndCompanyId(lr.getEmployeeId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return toResponse(lr, emp, lt);
    }

    @Transactional
    public LeaveRequestResponse overrideApprove(UUID id) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();

        LeaveRequest lr = findOwned(id, companyId);
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "Only pending requests can be overridden");
        }

        leaveApprovalService.overrideApprove(id, userId);
        lr.setStatus(LeaveStatus.APPROVED);
        lr.setUpdatedAt(Instant.now());
        leaveRequestRepository.save(lr);
        leaveBalanceService.deductBalance(lr.getEmployeeId(), lr.getLeaveTypeId(), companyId, lr.getWorkingDays());

        LeaveType lt = leaveTypeService.findByIdAndCompanyId(lr.getLeaveTypeId(), companyId);
        Employee emp = employeeRepository.findByIdAndCompanyId(lr.getEmployeeId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return toResponse(lr, emp, lt);
    }

    @Transactional
    public void cancel(UUID id) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();

        Employee employee = employeeRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("No employee profile found"));
        LeaveRequest lr = findOwned(id, companyId);

        if (!lr.getEmployeeId().equals(employee.getId())) {
            throw new BusinessException("NOT_YOUR_REQUEST", "You can only cancel your own leave requests");
        }
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "Only pending requests can be cancelled");
        }

        lr.setStatus(LeaveStatus.CANCELLED);
        lr.setUpdatedAt(Instant.now());
        leaveRequestRepository.save(lr);
    }

    private void verifyApproverAuthorization(LeaveRequest lr, UUID userId, String role, UUID companyId) {
        if ("HR_ADMIN".equals(role)) return;

        Employee manager = employeeRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new BusinessException("NO_EMPLOYEE_PROFILE", "No manager profile found"));

        Employee requestor = employeeRepository.findByIdAndCompanyId(lr.getEmployeeId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!manager.getId().equals(requestor.getManagerId())) {
            throw new BusinessException("NOT_AUTHORIZED", "You are not the manager of this employee");
        }
    }

    private List<LeaveRequestResponse> buildResponseList(List<LeaveRequest> requests, UUID companyId) {
        Map<UUID, String> typeNames = leaveTypeService.findActiveByCompanyId(companyId)
                .stream().collect(Collectors.toMap(LeaveType::getId, LeaveType::getName));
        Map<UUID, Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getCompanyId().equals(companyId))
                .collect(Collectors.toMap(Employee::getId, e -> e));

        return requests.stream().map(lr -> {
            Employee emp = employees.get(lr.getEmployeeId());
            String empName = emp != null ? emp.getFirstName() + " " + emp.getLastName() : "Unknown";
            String typeName = typeNames.getOrDefault(lr.getLeaveTypeId(), "Unknown");
            return LeaveRequestResponse.from(lr, empName, typeName);
        }).toList();
    }

    private LeaveRequestResponse toResponse(LeaveRequest lr, Employee emp, LeaveType lt) {
        return LeaveRequestResponse.from(lr,
                emp.getFirstName() + " " + emp.getLastName(), lt.getName());
    }

    private LeaveRequest findOwned(UUID id, UUID companyId) {
        return leaveRequestRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
    }

    private String getCurrentRole() {
        // Role is available via Spring Security context
        return org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }

    private void fireLeaveSubmittedNotification(Employee employee, LeaveType leaveType,
                                                 LeaveRequest saved, String reason, UUID companyId) {
        if (employee.getManagerId() == null) return;
        Employee manager = employeeRepository.findByIdAndCompanyId(employee.getManagerId(), companyId).orElse(null);
        if (manager == null || manager.getUserId() == null) return;
        User managerUser = userRepository.findById(manager.getUserId()).orElse(null);
        if (managerUser == null) return;
        User employeeUser = employee.getUserId() != null
                ? userRepository.findById(employee.getUserId()).orElse(null) : null;
        String employeeEmail = employeeUser != null ? employeeUser.getEmail()
                : employee.getFirstName() + "." + employee.getLastName() + "@company.com";

        notificationService.sendLeaveSubmitted(new LeaveNotificationService.LeaveSubmittedEvent(
                managerUser.getEmail(),
                manager.getFirstName() + " " + manager.getLastName(),
                employee.getFirstName() + " " + employee.getLastName(),
                leaveType.getName(),
                saved.getStartDate(),
                saved.getEndDate(),
                saved.getWorkingDays(),
                reason
        ));
    }

    private void fireLeaveApprovedNotification(LeaveRequest lr, UUID companyId) {
        Employee emp = employeeRepository.findByIdAndCompanyId(lr.getEmployeeId(), companyId).orElse(null);
        if (emp == null || emp.getUserId() == null) return;
        User user = userRepository.findById(emp.getUserId()).orElse(null);
        if (user == null) return;
        LeaveType lt = leaveTypeService.findByIdAndCompanyId(lr.getLeaveTypeId(), companyId);
        notificationService.sendLeaveApproved(new LeaveNotificationService.LeaveStatusEvent(
                user.getEmail(),
                emp.getFirstName() + " " + emp.getLastName(),
                lt.getName(),
                lr.getStartDate(),
                lr.getEndDate(),
                lr.getWorkingDays(),
                null
        ));
        fcmService.sendToUser(
                deviceTokenService.getTokensForUser(user.getId()),
                "Leave Approved ✓",
                lt.getName() + " leave approved for " + lr.getStartDate() + " – " + lr.getEndDate()
        );
    }

    private void fireLeaveRejectedNotification(LeaveRequest lr, String reason, UUID companyId) {
        Employee emp = employeeRepository.findByIdAndCompanyId(lr.getEmployeeId(), companyId).orElse(null);
        if (emp == null || emp.getUserId() == null) return;
        User user = userRepository.findById(emp.getUserId()).orElse(null);
        if (user == null) return;
        LeaveType lt = leaveTypeService.findByIdAndCompanyId(lr.getLeaveTypeId(), companyId);
        notificationService.sendLeaveRejected(new LeaveNotificationService.LeaveStatusEvent(
                user.getEmail(),
                emp.getFirstName() + " " + emp.getLastName(),
                lt.getName(),
                lr.getStartDate(),
                lr.getEndDate(),
                lr.getWorkingDays(),
                reason
        ));
        fcmService.sendToUser(
                deviceTokenService.getTokensForUser(user.getId()),
                "Leave Not Approved",
                lt.getName() + " leave request was rejected"
        );
    }
}
