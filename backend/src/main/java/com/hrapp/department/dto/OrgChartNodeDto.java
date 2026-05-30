package com.hrapp.department.dto;

import java.util.List;
import java.util.UUID;

public record OrgChartNodeDto(
        UUID id,
        String name,
        String description,
        long employeeCount,
        List<OrgChartNodeDto> children
) {}
