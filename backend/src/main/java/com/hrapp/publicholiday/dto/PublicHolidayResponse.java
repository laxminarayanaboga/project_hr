package com.hrapp.publicholiday.dto;

import com.hrapp.publicholiday.PublicHoliday;

import java.time.LocalDate;
import java.util.UUID;

public record PublicHolidayResponse(UUID id, String name, LocalDate holidayDate) {
    public static PublicHolidayResponse from(PublicHoliday ph) {
        return new PublicHolidayResponse(ph.getId(), ph.getName(), ph.getHolidayDate());
    }
}
