package com.hrapp.attendance.dto;

import com.hrapp.attendance.OvertimeStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record OvertimeRecordResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        LocalDate workDate,
        BigDecimal hoursWorked,
        BigDecimal contractedHours,
        BigDecimal overtimeHours,
        OvertimeStatus status,
        Instant approvedAt
) {}
