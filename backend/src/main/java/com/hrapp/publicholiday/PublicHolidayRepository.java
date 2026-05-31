package com.hrapp.publicholiday;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface PublicHolidayRepository extends JpaRepository<PublicHoliday, UUID> {

    List<PublicHoliday> findByCompanyIdOrderByHolidayDateAsc(UUID companyId);

    Optional<PublicHoliday> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndHolidayDate(UUID companyId, LocalDate date);

    @Query("SELECT ph.holidayDate FROM PublicHoliday ph WHERE ph.companyId = :companyId AND ph.holidayDate BETWEEN :from AND :to")
    Set<LocalDate> findDatesByCompanyIdAndRange(
            @Param("companyId") UUID companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
