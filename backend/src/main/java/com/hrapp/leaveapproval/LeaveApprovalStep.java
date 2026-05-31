package com.hrapp.leaveapproval;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leave_approval_steps")
@Getter
@Setter
@NoArgsConstructor
public class LeaveApprovalStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "leave_type_id", nullable = false)
    private UUID leaveTypeId;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "approver_type", nullable = false)
    private ApproverType approverType;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}
