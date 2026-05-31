package com.hrapp.leaverequest;

import com.hrapp.publicholiday.PublicHolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BusinessDayCalculator {

    private final PublicHolidayService publicHolidayService;

    public BigDecimal calculate(UUID companyId, LocalDate start, LocalDate end) {
        Set<LocalDate> holidays = publicHolidayService.getHolidayDates(companyId, start, end);
        int days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek dow = current.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY && !holidays.contains(current)) {
                days++;
            }
            current = current.plusDays(1);
        }
        return BigDecimal.valueOf(days);
    }
}
