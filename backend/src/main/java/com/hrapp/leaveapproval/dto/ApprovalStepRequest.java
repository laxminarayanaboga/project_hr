package com.hrapp.leaveapproval.dto;

import jakarta.validation.constraints.NotNull;

public record ApprovalStepRequest(
        @NotNull(message = "Approver type is required")
        com.hrapp.leaveapproval.ApproverType approverType,

        int stepOrder
) {}
