package com.hrapp.company.dto;

import java.util.List;
import java.util.UUID;

public record CompanyStatsResponse(
        long totalEmployees,
        long activeEmployees,
        long totalDepartments,
        long newHiresThisMonth,
        List<RecentHire> recentHires
) {
    public record RecentHire(
            UUID id,
            String firstName,
            String lastName,
            String jobTitle,
            String departmentName
    ) {}
}
