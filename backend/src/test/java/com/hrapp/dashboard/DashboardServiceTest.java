package com.hrapp.dashboard;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.dashboard.dto.ManagerDashboardResponse;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveRequestRepository;
import com.hrapp.leaverequest.LeaveStatus;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DashboardServiceTest {

    @Mock LeaveRequestRepository leaveRequestRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock LeaveTypeRepository leaveTypeRepository;

    @InjectMocks DashboardService service;

    private final UUID COMPANY_ID  = UUID.randomUUID();
    private final UUID USER_ID     = UUID.randomUUID();
    private final UUID EMPLOYEE_ID = UUID.randomUUID();
    private final UUID MANAGER_ID  = UUID.randomUUID();
    private final UUID LT_ID       = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        UserContext.setCurrentUser(USER_ID);
        mockSecurityContext("MANAGER");

        Employee manager = new Employee();
        manager.setId(MANAGER_ID);
        manager.setCompanyId(COMPANY_ID);
        manager.setUserId(USER_ID);
        manager.setFirstName("Alice");
        manager.setLastName("Manager");
        manager.setEmploymentStatus("ACTIVE");
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(java.util.Optional.of(manager));

        Employee report = new Employee();
        report.setId(EMPLOYEE_ID);
        report.setCompanyId(COMPANY_ID);
        report.setFirstName("Bob");
        report.setLastName("Report");
        report.setEmploymentStatus("ACTIVE");
        when(employeeRepository.findDirectReports(COMPANY_ID, MANAGER_ID)).thenReturn(List.of(report));

        LeaveType lt = new LeaveType();
        lt.setId(LT_ID);
        lt.setName("Annual Leave");
        when(leaveTypeRepository.findByCompanyIdOrderByNameAsc(COMPANY_ID)).thenReturn(List.of(lt));

        when(leaveRequestRepository.findOffToday(any(), any(), anyCollection())).thenReturn(List.of());
        when(leaveRequestRepository.findUpcoming(any(), any(), any(), anyCollection())).thenReturn(List.of());
        when(leaveRequestRepository.findApprovedInPeriod(any(), any(), any(), anyCollection())).thenReturn(List.of());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        UserContext.clear();
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(String role) {
        Authentication auth = mock(Authentication.class);
        when(auth.getAuthorities()).thenAnswer(inv -> List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    private LeaveRequest stubLeaveRequest() {
        LeaveRequest lr = new LeaveRequest();
        lr.setId(UUID.randomUUID());
        lr.setCompanyId(COMPANY_ID);
        lr.setEmployeeId(EMPLOYEE_ID);
        lr.setLeaveTypeId(LT_ID);
        lr.setStartDate(LocalDate.now());
        lr.setEndDate(LocalDate.now().plusDays(1));
        lr.setWorkingDays(BigDecimal.valueOf(2));
        lr.setStatus(LeaveStatus.APPROVED);
        return lr;
    }

    @Test
    void getManagerStats_returnsEmptyWhenNoTeam() {
        when(employeeRepository.findDirectReports(any(), any())).thenReturn(List.of());

        ManagerDashboardResponse result = service.getManagerStats();

        assertThat(result.whoIsOffToday()).isEmpty();
        assertThat(result.upcomingLeaves()).isEmpty();
        assertThat(result.absenceStats()).isEmpty();
    }

    @Test
    void getManagerStats_returnsWhoIsOffToday() {
        when(leaveRequestRepository.findOffToday(any(), any(), anyCollection()))
                .thenReturn(List.of(stubLeaveRequest()));

        ManagerDashboardResponse result = service.getManagerStats();

        assertThat(result.whoIsOffToday()).hasSize(1);
        assertThat(result.whoIsOffToday().get(0).name()).isEqualTo("Bob Report");
        assertThat(result.whoIsOffToday().get(0).leaveType()).isEqualTo("Annual Leave");
    }

    @Test
    void getManagerStats_returnsUpcomingLeaves() {
        LeaveRequest lr = stubLeaveRequest();
        lr.setStartDate(LocalDate.now().plusDays(5));
        lr.setEndDate(LocalDate.now().plusDays(7));
        when(leaveRequestRepository.findUpcoming(any(), any(), any(), anyCollection()))
                .thenReturn(List.of(lr));

        ManagerDashboardResponse result = service.getManagerStats();

        assertThat(result.upcomingLeaves()).hasSize(1);
        assertThat(result.upcomingLeaves().get(0).workingDays()).isEqualByComparingTo(BigDecimal.valueOf(2));
    }

    @Test
    void getManagerStats_calculatesAbsenceStats() {
        when(leaveRequestRepository.findApprovedInPeriod(any(), any(), any(), anyCollection()))
                .thenReturn(List.of(stubLeaveRequest()));

        ManagerDashboardResponse result = service.getManagerStats();

        assertThat(result.absenceStats()).hasSize(1);
        assertThat(result.absenceStats().get(0).daysAbsentThisMonth()).isEqualByComparingTo(BigDecimal.valueOf(2));
        assertThat(result.absenceStats().get(0).absenceRatePercent()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void getManagerStats_hrAdminSeesAllActiveEmployees() {
        mockSecurityContext("HR_ADMIN");

        Employee e1 = new Employee();
        e1.setId(UUID.randomUUID());
        e1.setCompanyId(COMPANY_ID);
        e1.setFirstName("C1");
        e1.setLastName("X");
        e1.setEmploymentStatus("ACTIVE");

        Employee e2 = new Employee();
        e2.setId(UUID.randomUUID());
        e2.setCompanyId(COMPANY_ID);
        e2.setFirstName("C2");
        e2.setLastName("X");
        e2.setEmploymentStatus("TERMINATED");

        when(employeeRepository.findByCompanyId(COMPANY_ID)).thenReturn(List.of(e1, e2));

        ManagerDashboardResponse result = service.getManagerStats();

        assertThat(result.absenceStats()).hasSize(1);
        assertThat(result.absenceStats().get(0).name()).isEqualTo("C1 X");
    }
}
