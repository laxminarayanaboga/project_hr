package com.hrapp.employee;

import com.hrapp.common.audit.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
public class Employee extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "preferred_name")
    private String preferredName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;
    private String nationality;
    private String phone;

    @Column(name = "personal_email")
    private String personalEmail;

    private String address;

    @Column(name = "employee_number")
    private String employeeNumber;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "employment_status", nullable = false)
    private String employmentStatus = "ACTIVE";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "probation_end")
    private LocalDate probationEnd;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "contracted_hours_per_week", nullable = false)
    private BigDecimal contractedHoursPerWeek = BigDecimal.valueOf(40.0);
}
