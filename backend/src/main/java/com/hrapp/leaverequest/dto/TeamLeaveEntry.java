package com.hrapp.leaverequest.dto;

import java.time.LocalDate;
import java.util.UUID;

public record TeamLeaveEntry(
        UUID requestId,
        UUID employeeId,
        String employeeName,
        String leaveTypeName,
        LocalDate startDate,
        LocalDate endDate
) {}
