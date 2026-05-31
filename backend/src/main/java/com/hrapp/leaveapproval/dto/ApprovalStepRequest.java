package com.hrapp.leaveapproval.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ApprovalStepRequest(
        @NotNull(message = "Approver type is required")
        com.hrapp.leaveapproval.ApproverType approverType,

        @Min(1) @Max(3)
        int stepOrder
) {}
