package com.hrapp.leaverequest.dto;

import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveRequestResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        UUID leaveTypeId,
        String leaveTypeName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal workingDays,
        String reason,
        LeaveStatus status,
        String rejectionReason,
        Instant createdAt
) {
    public static LeaveRequestResponse from(LeaveRequest lr, String employeeName, String leaveTypeName) {
        return new LeaveRequestResponse(
                lr.getId(), lr.getEmployeeId(), employeeName,
                lr.getLeaveTypeId(), leaveTypeName,
                lr.getStartDate(), lr.getEndDate(), lr.getWorkingDays(),
                lr.getReason(), lr.getStatus(), lr.getRejectionReason(), lr.getCreatedAt()
        );
    }
}
