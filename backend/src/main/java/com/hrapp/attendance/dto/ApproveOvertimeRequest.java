package com.hrapp.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public record ApproveOvertimeRequest(
        @NotBlank String action  // "APPROVE" or "REJECT"
) {}
