package com.hrapp.employee.dto;

import java.time.LocalDate;

public record DeactivateRequest(
        String reason,
        LocalDate endDate
) {}
