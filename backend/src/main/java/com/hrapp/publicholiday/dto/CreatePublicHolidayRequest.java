package com.hrapp.publicholiday.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreatePublicHolidayRequest(
        @NotBlank(message = "Name is required") String name,
        @NotNull(message = "Date is required") LocalDate holidayDate
) {}
