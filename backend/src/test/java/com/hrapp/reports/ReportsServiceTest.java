package com.hrapp.reports;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.department.Department;
import com.hrapp.department.DepartmentRepository;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveRequestRepository;
import com.hrapp.leaverequest.LeaveStatus;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import com.hrapp.reports.dto.LeaveReportResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportsServiceTest {

    @Mock LeaveRequestRepository leaveRequestRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock DepartmentRepository departmentRepository;
    @Mock LeaveTypeRepository leaveTypeRepository;

    @InjectMocks ReportsService service;

    private final UUID COMPANY_ID  = UUID.randomUUID();
    private final UUID EMPLOYEE_ID = UUID.randomUUID();
    private final UUID LT_ID       = UUID.randomUUID();
    private final UUID DEPT_ID     = UUID.randomUUID();
    private final LocalDate FROM   = LocalDate.of(2026, 1, 1);
    private final LocalDate TO     = LocalDate.of(2026, 12, 31);

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private Employee stubEmployee() {
        Employee e = new Employee();
        e.setId(EMPLOYEE_ID);
        e.setCompanyId(COMPANY_ID);
        e.setFirstName("Jane");
        e.setLastName("Smith");
        e.setEmployeeNumber("EMP001");
        e.setDepartmentId(DEPT_ID);
        return e;
    }

    private LeaveType stubLeaveType() {
        LeaveType lt = new LeaveType();
        lt.setId(LT_ID);
        lt.setName("Annual Leave");
        return lt;
    }

    private LeaveRequest stubLeaveRequest() {
        LeaveRequest lr = new LeaveRequest();
        lr.setId(UUID.randomUUID());
        lr.setCompanyId(COMPANY_ID);
        lr.setEmployeeId(EMPLOYEE_ID);
        lr.setLeaveTypeId(LT_ID);
        lr.setStartDate(LocalDate.of(2026, 3, 1));
        lr.setEndDate(LocalDate.of(2026, 3, 5));
        lr.setWorkingDays(BigDecimal.valueOf(5));
        lr.setStatus(LeaveStatus.APPROVED);
        return lr;
    }

    @Test
    void getLeaveReport_returnsRowsWithCorrectData() {
        when(leaveRequestRepository.findForReport(any(), any(), any(), isNull(), isNull(), isNull()))
                .thenReturn(List.of(stubLeaveRequest()));
        when(employeeRepository.findByCompanyId(COMPANY_ID)).thenReturn(List.of(stubEmployee()));
        when(leaveTypeRepository.findByCompanyIdOrderByNameAsc(COMPANY_ID)).thenReturn(List.of(stubLeaveType()));

        Department dept = new Department();
        dept.setId(DEPT_ID);
        dept.setName("Engineering");
        when(departmentRepository.findAllById(anyCollection())).thenReturn(List.of(dept));

        LeaveReportResponse result = service.getLeaveReport(FROM, TO, null, null, null);

        assertThat(result.rows()).hasSize(1);
        assertThat(result.rows().get(0).employeeName()).isEqualTo("Jane Smith");
        assertThat(result.rows().get(0).leaveType()).isEqualTo("Annual Leave");
        assertThat(result.rows().get(0).department()).isEqualTo("Engineering");
        assertThat(result.grandTotal()).isEqualByComparingTo(BigDecimal.valueOf(5));
    }

    @Test
    void getLeaveReport_emptyWhenNoRequests() {
        when(leaveRequestRepository.findForReport(any(), any(), any(), isNull(), isNull(), isNull()))
                .thenReturn(List.of());
        when(leaveTypeRepository.findByCompanyIdOrderByNameAsc(COMPANY_ID)).thenReturn(List.of());

        LeaveReportResponse result = service.getLeaveReport(FROM, TO, null, null, null);

        assertThat(result.rows()).isEmpty();
        assertThat(result.grandTotal()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void getLeaveReport_aggregatesTotalsByLeaveType() {
        LeaveRequest lr2 = stubLeaveRequest();
        lr2.setWorkingDays(BigDecimal.valueOf(3));

        when(leaveRequestRepository.findForReport(any(), any(), any(), isNull(), isNull(), isNull()))
                .thenReturn(List.of(stubLeaveRequest(), lr2));
        when(employeeRepository.findByCompanyId(COMPANY_ID)).thenReturn(List.of(stubEmployee()));
        when(leaveTypeRepository.findByCompanyIdOrderByNameAsc(COMPANY_ID)).thenReturn(List.of(stubLeaveType()));
        when(departmentRepository.findAllById(anyCollection())).thenReturn(List.of());

        LeaveReportResponse result = service.getLeaveReport(FROM, TO, null, null, null);

        assertThat(result.grandTotal()).isEqualByComparingTo(BigDecimal.valueOf(8));
        assertThat(result.totalsByLeaveType()).containsKey("Annual Leave");
        assertThat(result.totalsByLeaveType().get("Annual Leave")).isEqualByComparingTo(BigDecimal.valueOf(8));
    }

    @Test
    void exportCsv_returnsBytesWithHeader() {
        when(leaveRequestRepository.findForReport(any(), any(), any(), isNull(), isNull(), isNull()))
                .thenReturn(List.of(stubLeaveRequest()));
        when(employeeRepository.findByCompanyId(COMPANY_ID)).thenReturn(List.of(stubEmployee()));
        when(leaveTypeRepository.findByCompanyIdOrderByNameAsc(COMPANY_ID)).thenReturn(List.of(stubLeaveType()));
        when(departmentRepository.findAllById(anyCollection())).thenReturn(List.of());

        byte[] csv = service.exportCsv(FROM, TO, null, null, null);

        String content = new String(csv);
        assertThat(content).startsWith("Employee,Employee Number");
        assertThat(content).contains("Jane Smith");
    }
}
