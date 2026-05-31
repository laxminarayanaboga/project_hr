package com.hrapp.leavetype.dto;

import com.hrapp.leavetype.AccrualMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateLeaveTypeRequest(
        @Size(max = 100)
        String name,

        @DecimalMin(value = "0.0", message = "Days per year cannot be negative")
        BigDecimal daysPerYear,

        AccrualMethod accrualMethod,
        Boolean paid,
        Boolean requiresApproval,
        Boolean active
) {}
