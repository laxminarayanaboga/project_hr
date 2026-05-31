package com.hrapp.dashboard;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.dashboard.dto.ManagerDashboardResponse;
import com.hrapp.dashboard.dto.TeamAbsenceStats;
import com.hrapp.dashboard.dto.UpcomingLeaveEntry;
import com.hrapp.dashboard.dto.WhoIsOffEntry;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveRequestRepository;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    @Transactional(readOnly = true)
    public ManagerDashboardResponse getManagerStats() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        String role = getCurrentRole();

        List<Employee> teamMembers = resolveTeam(companyId, userId, role);
        if (teamMembers.isEmpty()) {
            return new ManagerDashboardResponse(List.of(), List.of(), List.of());
        }

        List<UUID> teamIds = teamMembers.stream().map(Employee::getId).toList();
        Map<UUID, String> nameById = teamMembers.stream()
                .collect(Collectors.toMap(Employee::getId, e -> e.getFirstName() + " " + e.getLastName()));
        Map<UUID, String> typeNameById = leaveTypeRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
                .collect(Collectors.toMap(LeaveType::getId, LeaveType::getName));

        LocalDate today = LocalDate.now();

        List<WhoIsOffEntry> offToday = leaveRequestRepository
                .findOffToday(companyId, today, teamIds).stream()
                .map(lr -> new WhoIsOffEntry(
                        lr.getEmployeeId(),
                        nameById.getOrDefault(lr.getEmployeeId(), "Unknown"),
                        typeNameById.getOrDefault(lr.getLeaveTypeId(), "Unknown"),
                        lr.getStartDate(), lr.getEndDate()))
                .toList();

        List<UpcomingLeaveEntry> upcoming = leaveRequestRepository
                .findUpcoming(companyId, today, today.plusDays(30), teamIds).stream()
                .map(lr -> new UpcomingLeaveEntry(
                        lr.getEmployeeId(),
                        nameById.getOrDefault(lr.getEmployeeId(), "Unknown"),
                        typeNameById.getOrDefault(lr.getLeaveTypeId(), "Unknown"),
                        lr.getStartDate(), lr.getEndDate(), lr.getWorkingDays()))
                .toList();

        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());
        List<LeaveRequest> monthLeaves = leaveRequestRepository
                .findApprovedInPeriod(companyId, monthStart, monthEnd, teamIds);

        Map<UUID, BigDecimal> daysAbsentById = new HashMap<>();
        for (LeaveRequest lr : monthLeaves) {
            daysAbsentById.merge(lr.getEmployeeId(), lr.getWorkingDays(), BigDecimal::add);
        }

        BigDecimal workingDaysInMonth = BigDecimal.valueOf(workingDays(monthStart, monthEnd));
        List<TeamAbsenceStats> absenceStats = teamMembers.stream()
                .map(e -> {
                    BigDecimal absent = daysAbsentById.getOrDefault(e.getId(), BigDecimal.ZERO);
                    BigDecimal rate = workingDaysInMonth.compareTo(BigDecimal.ZERO) > 0
                            ? absent.divide(workingDaysInMonth, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return new TeamAbsenceStats(e.getId(),
                            e.getFirstName() + " " + e.getLastName(), absent, rate);
                })
                .toList();

        return new ManagerDashboardResponse(offToday, upcoming, absenceStats);
    }

    private List<Employee> resolveTeam(UUID companyId, UUID userId, String role) {
        if ("HR_ADMIN".equals(role)) {
            return employeeRepository.findByCompanyId(companyId).stream()
                    .filter(e -> "ACTIVE".equals(e.getEmploymentStatus()))
                    .toList();
        }
        Employee manager = employeeRepository.findByUserIdAndCompanyId(userId, companyId).orElse(null);
        if (manager == null) return List.of();
        return employeeRepository.findDirectReports(companyId, manager.getId());
    }

    private int workingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate d = start;
        while (!d.isAfter(end)) {
            int dow = d.getDayOfWeek().getValue();
            if (dow < 6) count++;
            d = d.plusDays(1);
        }
        return count;
    }

    private String getCurrentRole() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
