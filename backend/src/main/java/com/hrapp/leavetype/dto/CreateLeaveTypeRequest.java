package com.hrapp.leavetype.dto;

import com.hrapp.leavetype.AccrualMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateLeaveTypeRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        String name,

        @NotNull(message = "Days per year is required")
        @DecimalMin(value = "0.0", message = "Days per year cannot be negative")
        BigDecimal daysPerYear,

        @NotNull(message = "Accrual method is required")
        AccrualMethod accrualMethod,

        boolean paid,
        boolean requiresApproval
) {}
