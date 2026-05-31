package com.hrapp.attendance;

import com.hrapp.attendance.dto.AttendanceRecordResponse;
import com.hrapp.attendance.dto.OvertimeRecordResponse;
import com.hrapp.attendance.dto.TodayStatusResponse;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepo;
    private final OvertimeRecordRepository overtimeRepo;
    private final EmployeeRepository employeeRepo;

    @Transactional
    public AttendanceRecordResponse clockIn() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee employee = resolveEmployee(userId, companyId);

        attendanceRepo.findActiveSession(employee.getId(), companyId).ifPresent(r -> {
            throw new BusinessException("ALREADY_CLOCKED_IN", "You already have an active clock-in session");
        });

        AttendanceRecord record = new AttendanceRecord();
        record.setCompanyId(companyId);
        record.setEmployeeId(employee.getId());
        record.setClockIn(Instant.now());
        return toResponse(attendanceRepo.save(record));
    }

    @Transactional
    public AttendanceRecordResponse clockOut() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee employee = resolveEmployee(userId, companyId);

        AttendanceRecord record = attendanceRepo.findActiveSession(employee.getId(), companyId)
                .orElseThrow(() -> new BusinessException("NOT_CLOCKED_IN", "No active clock-in session found"));

        Instant now = Instant.now();
        record.setClockOut(now);

        long seconds = now.getEpochSecond() - record.getClockIn().getEpochSecond();
        BigDecimal hoursWorked = BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
        record.setHoursWorked(hoursWorked);
        attendanceRepo.save(record);

        generateOvertimeIfNeeded(record, employee);

        return toResponse(record);
    }

    public TodayStatusResponse todayStatus() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee employee = resolveEmployee(userId, companyId);

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        List<AttendanceRecord> todayRecords = attendanceRepo.findTodayRecords(employee.getId(), companyId, startOfDay);

        if (todayRecords.isEmpty()) {
            return new TodayStatusResponse(false, null, null, null);
        }

        AttendanceRecord latest = todayRecords.get(0);
        boolean active = latest.getClockOut() == null;
        return new TodayStatusResponse(active, latest.getId(), latest.getClockIn(), latest.getClockOut());
    }

    public List<AttendanceRecordResponse> history(int page, int size) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee employee = resolveEmployee(userId, companyId);
        return attendanceRepo.findHistory(employee.getId(), companyId, PageRequest.of(page, size))
                .stream().map(this::toResponse).toList();
    }

    public List<OvertimeRecordResponse> getTeamOvertime(UUID teamId) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee manager = resolveEmployee(userId, companyId);
        // HR_ADMIN can pass null teamId to see all; Manager sees their own team
        UUID effectiveTeamId = teamId != null ? teamId : manager.getId();
        return overtimeRepo.findByTeam(companyId, effectiveTeamId).stream()
                .map(o -> toOvertimeResponse(o, companyId))
                .toList();
    }

    @Transactional
    public OvertimeRecordResponse approveOvertime(UUID overtimeId, String action) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee manager = resolveEmployee(userId, companyId);

        OvertimeRecord record = overtimeRepo.findByIdAndCompanyId(overtimeId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime record not found"));

        if (record.getStatus() != OvertimeStatus.PENDING) {
            throw new BusinessException("ALREADY_PROCESSED", "This overtime record has already been processed");
        }

        if ("APPROVE".equalsIgnoreCase(action)) {
            record.setStatus(OvertimeStatus.APPROVED);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            record.setStatus(OvertimeStatus.REJECTED);
        } else {
            throw new BusinessException("INVALID_ACTION", "Action must be APPROVE or REJECT");
        }

        record.setApprovedBy(manager.getId());
        record.setApprovedAt(Instant.now());
        return toOvertimeResponse(overtimeRepo.save(record), companyId);
    }

    private void generateOvertimeIfNeeded(AttendanceRecord record, Employee employee) {
        if (record.getHoursWorked() == null) return;
        BigDecimal contractedDaily = employee.getContractedHoursPerWeek()
                .divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        BigDecimal overtime = record.getHoursWorked().subtract(contractedDaily);
        if (overtime.compareTo(BigDecimal.ZERO) <= 0) return;

        OvertimeRecord ot = new OvertimeRecord();
        ot.setCompanyId(record.getCompanyId());
        ot.setEmployeeId(record.getEmployeeId());
        ot.setAttendanceRecordId(record.getId());
        ot.setWorkDate(record.getClockIn().atZone(ZoneOffset.UTC).toLocalDate());
        ot.setHoursWorked(record.getHoursWorked());
        ot.setContractedHours(contractedDaily);
        ot.setOvertimeHours(overtime.setScale(2, RoundingMode.HALF_UP));
        ot.setStatus(OvertimeStatus.PENDING);
        overtimeRepo.save(ot);
    }

    private Employee resolveEmployee(UUID userId, UUID companyId) {
        return employeeRepo.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new BusinessException("NO_EMPLOYEE_PROFILE",
                        "No employee profile found. Please contact HR."));
    }

    private AttendanceRecordResponse toResponse(AttendanceRecord r) {
        return new AttendanceRecordResponse(
                r.getId(), r.getEmployeeId(), r.getClockIn(),
                r.getClockOut(), r.getHoursWorked(), r.getClockOut() == null
        );
    }

    private OvertimeRecordResponse toOvertimeResponse(OvertimeRecord o, UUID companyId) {
        String name = employeeRepo.findByIdAndCompanyId(o.getEmployeeId(), companyId)
                .map(e -> e.getFirstName() + " " + e.getLastName())
                .orElse("Unknown");
        return new OvertimeRecordResponse(
                o.getId(), o.getEmployeeId(), name, o.getWorkDate(),
                o.getHoursWorked(), o.getContractedHours(), o.getOvertimeHours(),
                o.getStatus(), o.getApprovedAt()
        );
    }
}
