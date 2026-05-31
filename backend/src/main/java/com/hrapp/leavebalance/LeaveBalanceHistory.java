package com.hrapp.leavebalance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leave_balance_history")
@Getter
@Setter
@NoArgsConstructor
public class LeaveBalanceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "balance_id", nullable = false)
    private UUID balanceId;

    @Column(name = "change_type", nullable = false)
    private String changeType;  // ACCRUAL, DEDUCTION, ADJUSTMENT, REFUND

    @Column(name = "days_delta", nullable = false)
    private BigDecimal daysDelta;

    @Column(name = "reason")
    private String reason;

    @Column(name = "performed_by")
    private UUID performedBy;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}
