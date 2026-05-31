package com.hrapp.employee.dto;

import com.hrapp.employee.Employee;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeResponse(
        UUID id,
        UUID companyId,
        String firstName,
        String lastName,
        String preferredName,
        LocalDate dateOfBirth,
        String gender,
        String nationality,
        String phone,
        String personalEmail,
        String address,
        String employeeNumber,
        String jobTitle,
        String employmentType,
        String employmentStatus,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate probationEnd,
        UUID departmentId,
        String departmentName,
        UUID managerId,
        String managerName,
        String avatarUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static EmployeeResponse from(Employee e, String departmentName, String managerName) {
        return new EmployeeResponse(
                e.getId(),
                e.getCompanyId(),
                e.getFirstName(),
                e.getLastName(),
                e.getPreferredName(),
                e.getDateOfBirth(),
                e.getGender(),
                e.getNationality(),
                e.getPhone(),
                e.getPersonalEmail(),
                e.getAddress(),
                e.getEmployeeNumber(),
                e.getJobTitle(),
                e.getEmploymentType(),
                e.getEmploymentStatus(),
                e.getStartDate(),
                e.getEndDate(),
                e.getProbationEnd(),
                e.getDepartmentId(),
                departmentName,
                e.getManagerId(),
                managerName,
                e.getAvatarUrl(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
