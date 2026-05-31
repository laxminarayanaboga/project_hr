package com.hrapp.dashboard.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TeamAbsenceStats(
        UUID employeeId,
        String name,
        BigDecimal daysAbsentThisMonth,
        BigDecimal absenceRatePercent
) {}
