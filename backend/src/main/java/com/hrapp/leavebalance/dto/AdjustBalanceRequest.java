package com.hrapp.leavebalance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AdjustBalanceRequest(
        @NotNull(message = "Days delta is required") BigDecimal daysDelta,
        @NotBlank(message = "Reason is required") String reason
) {}
