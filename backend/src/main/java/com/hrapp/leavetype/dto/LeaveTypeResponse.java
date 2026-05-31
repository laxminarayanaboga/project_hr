package com.hrapp.leavetype.dto;

import com.hrapp.leavetype.AccrualMethod;
import com.hrapp.leavetype.LeaveType;

import java.math.BigDecimal;
import java.util.UUID;

public record LeaveTypeResponse(
        UUID id,
        String name,
        BigDecimal daysPerYear,
        AccrualMethod accrualMethod,
        boolean paid,
        boolean requiresApproval,
        boolean active
) {
    public static LeaveTypeResponse from(LeaveType lt) {
        return new LeaveTypeResponse(
                lt.getId(), lt.getName(), lt.getDaysPerYear(),
                lt.getAccrualMethod(), lt.isPaid(), lt.isRequiresApproval(), lt.isActive()
        );
    }
}
