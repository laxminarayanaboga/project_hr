package com.hrapp.notification;

import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveRequestRepository;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import com.hrapp.user.User;
import com.hrapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class WeeklyLeaveDigestScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeeklyLeaveDigestScheduler.class);

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;
    private final LeaveNotificationService notificationService;

    // Runs every Monday at 08:00 UK time
    @Scheduled(cron = "0 0 8 * * MON", zone = "Europe/London")
    public void sendDigests() {
        log.info("Running weekly leave digest");

        List<Employee> allManagers = employeeRepository.findAll().stream()
                .filter(e -> e.getUserId() != null && "ACTIVE".equals(e.getEmploymentStatus()))
                .toList();

        // Group managers by company — find those who have direct reports
        Map<UUID, List<Employee>> byCompany = allManagers.stream()
                .collect(Collectors.groupingBy(Employee::getCompanyId));

        for (Map.Entry<UUID, List<Employee>> entry : byCompany.entrySet()) {
            UUID companyId = entry.getKey();
            List<Employee> companyEmployees = entry.getValue();
            Map<UUID, Employee> byId = companyEmployees.stream()
                    .collect(Collectors.toMap(Employee::getId, e -> e));

            // Build a map: managerId → their direct reports
            Map<UUID, List<UUID>> managerToReports = companyEmployees.stream()
                    .filter(e -> e.getManagerId() != null)
                    .collect(Collectors.groupingBy(Employee::getManagerId,
                            Collectors.mapping(Employee::getId, Collectors.toList())));

            if (managerToReports.isEmpty()) continue;

            // Fetch all pending leave requests for this company in one query
            List<UUID> allReportIds = managerToReports.values().stream()
                    .flatMap(List::stream).distinct().toList();
            if (allReportIds.isEmpty()) continue;

            List<LeaveRequest> pendingRequests = leaveRequestRepository
                    .findPendingByEmployeeIds(companyId, allReportIds);
            if (pendingRequests.isEmpty()) continue;

            Map<UUID, String> leaveTypeNames = leaveTypeRepository.findAll().stream()
                    .filter(lt -> lt.getCompanyId().equals(companyId))
                    .collect(Collectors.toMap(LeaveType::getId, LeaveType::getName));

            // Map pending requests by employeeId for quick lookup
            Map<UUID, List<LeaveRequest>> requestsByEmployee = pendingRequests.stream()
                    .collect(Collectors.groupingBy(LeaveRequest::getEmployeeId));

            for (Map.Entry<UUID, List<UUID>> mgEntry : managerToReports.entrySet()) {
                UUID managerId = mgEntry.getKey();
                Employee manager = byId.get(managerId);
                if (manager == null || manager.getUserId() == null) continue;

                User managerUser = userRepository.findById(manager.getUserId()).orElse(null);
                if (managerUser == null) continue;

                List<LeaveNotificationService.PendingLeaveItem> items = new ArrayList<>();
                for (UUID reportId : mgEntry.getValue()) {
                    List<LeaveRequest> reqs = requestsByEmployee.getOrDefault(reportId, List.of());
                    Employee emp = byId.get(reportId);
                    if (emp == null) continue;
                    String empName = emp.getFirstName() + " " + emp.getLastName();
                    for (LeaveRequest req : reqs) {
                        items.add(new LeaveNotificationService.PendingLeaveItem(
                                empName,
                                leaveTypeNames.getOrDefault(req.getLeaveTypeId(), "Unknown"),
                                req.getStartDate(),
                                req.getEndDate(),
                                req.getWorkingDays()
                        ));
                    }
                }

                String managerName = manager.getFirstName() + " " + manager.getLastName();
                notificationService.sendWeeklyDigest(managerUser.getEmail(), managerName, items);
            }
        }

        log.info("Weekly leave digest complete");
    }
}
