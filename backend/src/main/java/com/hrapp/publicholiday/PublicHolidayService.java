package com.hrapp.publicholiday;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.publicholiday.dto.CreatePublicHolidayRequest;
import com.hrapp.publicholiday.dto.PublicHolidayResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicHolidayService {

    private final PublicHolidayRepository repository;

    @Transactional(readOnly = true)
    public List<PublicHolidayResponse> list() {
        return repository.findByCompanyIdOrderByHolidayDateAsc(TenantContext.getCurrentCompany())
                .stream().map(PublicHolidayResponse::from).toList();
    }

    @Transactional
    public PublicHolidayResponse create(CreatePublicHolidayRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        if (repository.existsByCompanyIdAndHolidayDate(companyId, request.holidayDate())) {
            throw new BusinessException("DUPLICATE_HOLIDAY", "A public holiday already exists on this date");
        }
        PublicHoliday ph = new PublicHoliday();
        ph.setCompanyId(companyId);
        ph.setName(request.name());
        ph.setHolidayDate(request.holidayDate());
        return PublicHolidayResponse.from(repository.save(ph));
    }

    @Transactional
    public void delete(UUID id) {
        UUID companyId = TenantContext.getCurrentCompany();
        PublicHoliday ph = repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Public holiday not found"));
        repository.delete(ph);
    }

    public Set<LocalDate> getHolidayDates(UUID companyId, LocalDate from, LocalDate to) {
        return repository.findDatesByCompanyIdAndRange(companyId, from, to);
    }

    @Transactional
    public void seedDefaultsForCompany(UUID companyId) {
        record H(String name, LocalDate date) {}
        List<H> holidays = List.of(
                // 2026 England & Wales
                new H("New Year's Day",          LocalDate.of(2026,  1,  1)),
                new H("Good Friday",             LocalDate.of(2026,  4,  3)),
                new H("Easter Monday",           LocalDate.of(2026,  4,  6)),
                new H("Early May Bank Holiday",  LocalDate.of(2026,  5,  4)),
                new H("Spring Bank Holiday",     LocalDate.of(2026,  5, 25)),
                new H("Summer Bank Holiday",     LocalDate.of(2026,  8, 31)),
                new H("Christmas Day",           LocalDate.of(2026, 12, 25)),
                new H("Boxing Day",              LocalDate.of(2026, 12, 28)),
                // 2027 England & Wales
                new H("New Year's Day",          LocalDate.of(2027,  1,  1)),
                new H("Good Friday",             LocalDate.of(2027,  3, 26)),
                new H("Easter Monday",           LocalDate.of(2027,  3, 29)),
                new H("Early May Bank Holiday",  LocalDate.of(2027,  5,  3)),
                new H("Spring Bank Holiday",     LocalDate.of(2027,  5, 31)),
                new H("Summer Bank Holiday",     LocalDate.of(2027,  8, 30)),
                new H("Christmas Day",           LocalDate.of(2027, 12, 27)),
                new H("Boxing Day",              LocalDate.of(2027, 12, 28))
        );
        for (H h : holidays) {
            if (!repository.existsByCompanyIdAndHolidayDate(companyId, h.date())) {
                PublicHoliday ph = new PublicHoliday();
                ph.setCompanyId(companyId);
                ph.setName(h.name());
                ph.setHolidayDate(h.date());
                repository.save(ph);
            }
        }
    }
}
