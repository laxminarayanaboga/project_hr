package com.hrapp.leaveapproval;

import com.hrapp.leaverequest.LeaveStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leave_request_approvals")
@Getter
@Setter
@NoArgsConstructor
public class LeaveRequestApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "leave_request_id", nullable = false)
    private UUID leaveRequestId;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "approver_type", nullable = false)
    private ApproverType approverType;

    @Column(name = "approver_id")
    private UUID approverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "comment")
    private String comment;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}
