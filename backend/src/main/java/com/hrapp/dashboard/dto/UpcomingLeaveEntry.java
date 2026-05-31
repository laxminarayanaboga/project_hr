package com.hrapp.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpcomingLeaveEntry(
        UUID employeeId,
        String name,
        String leaveType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal workingDays
) {}
