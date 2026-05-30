package com.hrapp.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCompanyRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 50) String phone,
        String address,
        @Size(max = 100) String country
) {}
