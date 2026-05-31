package com.hrapp.leavebalance.dto;

import com.hrapp.leavebalance.LeaveBalance;

import java.math.BigDecimal;
import java.util.UUID;

public record LeaveBalanceResponse(
        UUID id,
        UUID leaveTypeId,
        String leaveTypeName,
        int year,
        BigDecimal entitledDays,
        BigDecimal usedDays,
        BigDecimal adjustedDays,
        BigDecimal remainingDays
) {
    public static LeaveBalanceResponse from(LeaveBalance b, String typeName) {
        return new LeaveBalanceResponse(
                b.getId(), b.getLeaveTypeId(), typeName, b.getYear(),
                b.getEntitledDays(), b.getUsedDays(), b.getAdjustedDays(), b.remainingDays()
        );
    }
}
