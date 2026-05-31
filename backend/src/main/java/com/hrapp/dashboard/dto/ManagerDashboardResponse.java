package com.hrapp.dashboard.dto;

import java.util.List;

public record ManagerDashboardResponse(
        List<WhoIsOffEntry> whoIsOffToday,
        List<UpcomingLeaveEntry> upcomingLeaves,
        List<TeamAbsenceStats> absenceStats
) {}
