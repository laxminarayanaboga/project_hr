package com.hrapp.leaverequest.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateLeaveRequestRequest(
        @NotNull(message = "Leave type is required") UUID leaveTypeId,
        @NotNull(message = "Start date is required") LocalDate startDate,
        @NotNull(message = "End date is required") LocalDate endDate,
        String reason
) {}
