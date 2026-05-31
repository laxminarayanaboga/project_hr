package com.hrapp.leaveapproval.dto;

import com.hrapp.leaveapproval.ApproverType;
import com.hrapp.leaveapproval.LeaveApprovalStep;

import java.util.UUID;

public record ApprovalChainResponse(UUID id, int stepOrder, ApproverType approverType) {
    public static ApprovalChainResponse from(LeaveApprovalStep s) {
        return new ApprovalChainResponse(s.getId(), s.getStepOrder(), s.getApproverType());
    }
}
