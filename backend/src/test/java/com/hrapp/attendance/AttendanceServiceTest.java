package com.hrapp.attendance;

import com.hrapp.attendance.dto.AttendanceRecordResponse;
import com.hrapp.attendance.dto.OvertimeRecordResponse;
import com.hrapp.attendance.dto.TodayStatusResponse;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AttendanceServiceTest {

    @Mock AttendanceRecordRepository attendanceRepo;
    @Mock OvertimeRecordRepository overtimeRepo;
    @Mock EmployeeRepository employeeRepo;

    @InjectMocks AttendanceService service;

    private final UUID COMPANY_ID  = UUID.randomUUID();
    private final UUID USER_ID     = UUID.randomUUID();
    private final UUID EMPLOYEE_ID = UUID.randomUUID();

    private Employee employee;

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        UserContext.setCurrentUser(USER_ID);
        employee = new Employee();
        employee.setId(EMPLOYEE_ID);
        employee.setCompanyId(COMPANY_ID);
        employee.setUserId(USER_ID);
        employee.setFirstName("Jane");
        employee.setLastName("Doe");
        employee.setContractedHoursPerWeek(BigDecimal.valueOf(40));
        employee.setEmploymentStatus("ACTIVE");
        when(employeeRepo.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(employee));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        UserContext.clear();
    }

    // --- Clock-in ---

    @Test
    void clockIn_createsRecord() {
        when(attendanceRepo.findActiveSession(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.empty());
        when(attendanceRepo.save(any())).thenAnswer(inv -> {
            AttendanceRecord r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        AttendanceRecordResponse response = service.clockIn();

        assertThat(response.active()).isTrue();
        assertThat(response.clockIn()).isNotNull();
        assertThat(response.clockOut()).isNull();
    }

    @Test
    void clockIn_whenAlreadyClockedIn_throws() {
        AttendanceRecord active = new AttendanceRecord();
        active.setId(UUID.randomUUID());
        when(attendanceRepo.findActiveSession(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(active));

        assertThatThrownBy(() -> service.clockIn())
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already have an active clock-in");
    }

    // --- Clock-out ---

    @Test
    void clockOut_completesRecord_andCalculatesHours() {
        AttendanceRecord active = new AttendanceRecord();
        active.setId(UUID.randomUUID());
        active.setCompanyId(COMPANY_ID);
        active.setEmployeeId(EMPLOYEE_ID);
        active.setClockIn(Instant.now().minus(9, ChronoUnit.HOURS));

        when(attendanceRepo.findActiveSession(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(active));
        when(attendanceRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(overtimeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AttendanceRecordResponse response = service.clockOut();

        assertThat(response.clockOut()).isNotNull();
        assertThat(response.hoursWorked()).isGreaterThan(BigDecimal.valueOf(8));
        assertThat(response.active()).isFalse();
    }

    @Test
    void clockOut_whenNotClockedIn_throws() {
        when(attendanceRepo.findActiveSession(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.clockOut())
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No active clock-in session");
    }

    @Test
    void clockOut_generatesOvertimeRecord_whenHoursExceedContracted() {
        AttendanceRecord active = new AttendanceRecord();
        active.setId(UUID.randomUUID());
        active.setCompanyId(COMPANY_ID);
        active.setEmployeeId(EMPLOYEE_ID);
        active.setClockIn(Instant.now().minus(10, ChronoUnit.HOURS));

        when(attendanceRepo.findActiveSession(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(active));
        when(attendanceRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(overtimeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.clockOut();

        ArgumentCaptor<OvertimeRecord> captor = ArgumentCaptor.forClass(OvertimeRecord.class);
        verify(overtimeRepo).save(captor.capture());
        assertThat(captor.getValue().getOvertimeHours()).isGreaterThan(BigDecimal.ZERO);
        assertThat(captor.getValue().getStatus()).isEqualTo(OvertimeStatus.PENDING);
    }

    @Test
    void clockOut_noOvertimeRecord_whenHoursWithinContracted() {
        AttendanceRecord active = new AttendanceRecord();
        active.setId(UUID.randomUUID());
        active.setCompanyId(COMPANY_ID);
        active.setEmployeeId(EMPLOYEE_ID);
        active.setClockIn(Instant.now().minus(7, ChronoUnit.HOURS));

        when(attendanceRepo.findActiveSession(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(active));
        when(attendanceRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.clockOut();

        verify(overtimeRepo, never()).save(any());
    }

    // --- Today status ---

    @Test
    void todayStatus_returnsActive_whenSessionOpen() {
        AttendanceRecord active = new AttendanceRecord();
        active.setId(UUID.randomUUID());
        active.setClockIn(Instant.now().minus(2, ChronoUnit.HOURS));

        when(attendanceRepo.findTodayRecords(eq(EMPLOYEE_ID), eq(COMPANY_ID), any()))
                .thenReturn(List.of(active));

        TodayStatusResponse status = service.todayStatus();

        assertThat(status.active()).isTrue();
        assertThat(status.clockIn()).isNotNull();
        assertThat(status.clockOut()).isNull();
    }

    @Test
    void todayStatus_returnsInactive_whenNoRecords() {
        when(attendanceRepo.findTodayRecords(eq(EMPLOYEE_ID), eq(COMPANY_ID), any()))
                .thenReturn(List.of());

        TodayStatusResponse status = service.todayStatus();

        assertThat(status.active()).isFalse();
    }

    // --- Overtime approval ---

    @Test
    void approveOvertime_setsApproved() {
        UUID overtimeId = UUID.randomUUID();
        OvertimeRecord ot = new OvertimeRecord();
        ot.setId(overtimeId);
        ot.setCompanyId(COMPANY_ID);
        ot.setEmployeeId(EMPLOYEE_ID);
        ot.setStatus(OvertimeStatus.PENDING);
        ot.setOvertimeHours(BigDecimal.valueOf(2));
        ot.setHoursWorked(BigDecimal.valueOf(10));
        ot.setContractedHours(BigDecimal.valueOf(8));

        when(overtimeRepo.findByIdAndCompanyId(overtimeId, COMPANY_ID)).thenReturn(Optional.of(ot));
        when(overtimeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(employeeRepo.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(employee));

        OvertimeRecordResponse response = service.approveOvertime(overtimeId, "APPROVE");

        assertThat(response.status()).isEqualTo(OvertimeStatus.APPROVED);
        assertThat(response.approvedAt()).isNotNull();
    }

    @Test
    void approveOvertime_alreadyProcessed_throws() {
        UUID overtimeId = UUID.randomUUID();
        OvertimeRecord ot = new OvertimeRecord();
        ot.setId(overtimeId);
        ot.setCompanyId(COMPANY_ID);
        ot.setStatus(OvertimeStatus.APPROVED);

        when(overtimeRepo.findByIdAndCompanyId(overtimeId, COMPANY_ID)).thenReturn(Optional.of(ot));

        assertThatThrownBy(() -> service.approveOvertime(overtimeId, "APPROVE"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already been processed");
    }

    @Test
    void approveOvertime_invalidAction_throws() {
        UUID overtimeId = UUID.randomUUID();
        OvertimeRecord ot = new OvertimeRecord();
        ot.setId(overtimeId);
        ot.setCompanyId(COMPANY_ID);
        ot.setStatus(OvertimeStatus.PENDING);

        when(overtimeRepo.findByIdAndCompanyId(overtimeId, COMPANY_ID)).thenReturn(Optional.of(ot));

        assertThatThrownBy(() -> service.approveOvertime(overtimeId, "DENY"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Action must be APPROVE or REJECT");
    }
}
