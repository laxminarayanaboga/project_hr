package com.hrapp.department.dto;

import com.hrapp.department.Department;

import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String description,
        UUID parentId,
        String parentName
) {
    public static DepartmentResponse from(Department d) {
        return new DepartmentResponse(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getParent() != null ? d.getParent().getId() : null,
                d.getParent() != null ? d.getParent().getName() : null
        );
    }
}
