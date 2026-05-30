package com.hrapp.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateEmployeeRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required") String lastName,
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
        @NotNull(message = "Start date is required") LocalDate startDate,
        LocalDate endDate,
        LocalDate probationEnd,
        UUID departmentId,
        UUID managerId
) {}
