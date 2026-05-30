package com.hrapp.department.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record UpdateDepartmentRequest(
        @NotBlank(message = "Department name is required") String name,
        String description,
        UUID parentId
) {}
