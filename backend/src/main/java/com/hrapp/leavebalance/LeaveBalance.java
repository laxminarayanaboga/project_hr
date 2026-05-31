package com.hrapp.leavebalance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leave_balances")
@Getter
@Setter
@NoArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "leave_type_id", nullable = false)
    private UUID leaveTypeId;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "entitled_days", nullable = false)
    private BigDecimal entitledDays = BigDecimal.ZERO;

    @Column(name = "used_days", nullable = false)
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "adjusted_days", nullable = false)
    private BigDecimal adjustedDays = BigDecimal.ZERO;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public BigDecimal remainingDays() {
        return entitledDays.add(adjustedDays).subtract(usedDays);
    }
}
