package com.hrapp.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveReportRow(
        UUID requestId,
        String employeeName,
        String employeeNumber,
        String department,
        String leaveType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal workingDays,
        String status
) {}
