package com.hrapp.employee.dto;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateEmployeeRequest(
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
        LocalDate startDate,
        LocalDate endDate,
        LocalDate probationEnd,
        UUID departmentId,
        UUID managerId
) {}
