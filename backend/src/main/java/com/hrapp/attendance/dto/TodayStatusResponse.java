package com.hrapp.attendance.dto;

import java.time.Instant;
import java.util.UUID;

public record TodayStatusResponse(
        boolean active,
        UUID recordId,
        Instant clockIn,
        Instant clockOut
) {}
