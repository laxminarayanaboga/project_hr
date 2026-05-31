package com.hrapp.attendance;

import com.hrapp.common.audit.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "overtime_records")
@Getter
@Setter
@NoArgsConstructor
public class OvertimeRecord extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "attendance_record_id", nullable = false)
    private UUID attendanceRecordId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "hours_worked", nullable = false)
    private BigDecimal hoursWorked;

    @Column(name = "contracted_hours", nullable = false)
    private BigDecimal contractedHours;

    @Column(name = "overtime_hours", nullable = false)
    private BigDecimal overtimeHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OvertimeStatus status = OvertimeStatus.PENDING;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;
}
