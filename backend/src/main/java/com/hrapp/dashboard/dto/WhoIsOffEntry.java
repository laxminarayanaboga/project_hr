package com.hrapp.dashboard.dto;

import java.time.LocalDate;
import java.util.UUID;

public record WhoIsOffEntry(
        UUID employeeId,
        String name,
        String leaveType,
        LocalDate startDate,
        LocalDate endDate
) {}
