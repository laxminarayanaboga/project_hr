package com.hrapp.company.dto;

import com.hrapp.company.Company;

import java.util.UUID;

public record CompanyProfileResponse(
        UUID id,
        String name,
        String slug,
        String email,
        String phone,
        String address,
        String country,
        String logoUrl
) {
    public static CompanyProfileResponse from(Company c) {
        return new CompanyProfileResponse(
                c.getId(), c.getName(), c.getSlug(), c.getEmail(),
                c.getPhone(), c.getAddress(), c.getCountry(), c.getLogoUrl()
        );
    }
}
