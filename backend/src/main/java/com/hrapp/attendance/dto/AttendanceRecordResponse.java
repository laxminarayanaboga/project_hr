package com.hrapp.attendance.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AttendanceRecordResponse(
        UUID id,
        UUID employeeId,
        Instant clockIn,
        Instant clockOut,
        BigDecimal hoursWorked,
        boolean active
) {}
