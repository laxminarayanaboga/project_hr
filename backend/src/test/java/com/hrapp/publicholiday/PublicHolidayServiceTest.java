package com.hrapp.publicholiday;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.publicholiday.dto.CreatePublicHolidayRequest;
import com.hrapp.publicholiday.dto.PublicHolidayResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicHolidayServiceTest {

    @Mock PublicHolidayRepository repository;
    @InjectMocks PublicHolidayService service;

    private final UUID COMPANY_ID = UUID.randomUUID();
    private final UUID PH_ID = UUID.randomUUID();
    private final LocalDate XMAS = LocalDate.of(2026, 12, 25);

    @BeforeEach void setUp() { TenantContext.setCurrentCompany(COMPANY_ID); }
    @AfterEach  void tearDown() { TenantContext.clear(); }

    private PublicHoliday stub() {
        PublicHoliday ph = new PublicHoliday();
        ph.setId(PH_ID);
        ph.setCompanyId(COMPANY_ID);
        ph.setName("Christmas Day");
        ph.setHolidayDate(XMAS);
        return ph;
    }

    @Test
    void list_returnsHolidaysForCompany() {
        when(repository.findByCompanyIdOrderByHolidayDateAsc(COMPANY_ID)).thenReturn(List.of(stub()));
        List<PublicHolidayResponse> result = service.list();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Christmas Day");
    }

    @Test
    void create_savesHoliday() {
        when(repository.existsByCompanyIdAndHolidayDate(COMPANY_ID, XMAS)).thenReturn(false);
        when(repository.save(any())).thenReturn(stub());

        PublicHolidayResponse result = service.create(new CreatePublicHolidayRequest("Christmas Day", XMAS));
        assertThat(result.holidayDate()).isEqualTo(XMAS);
    }

    @Test
    void create_throwsOnDuplicateDate() {
        when(repository.existsByCompanyIdAndHolidayDate(COMPANY_ID, XMAS)).thenReturn(true);
        assertThatThrownBy(() -> service.create(new CreatePublicHolidayRequest("Xmas", XMAS)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void delete_removesHoliday() {
        when(repository.findByIdAndCompanyId(PH_ID, COMPANY_ID)).thenReturn(Optional.of(stub()));
        service.delete(PH_ID);
        verify(repository).delete(any(PublicHoliday.class));
    }

    @Test
    void delete_throwsNotFound_whenNotOwned() {
        when(repository.findByIdAndCompanyId(PH_ID, COMPANY_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.delete(PH_ID)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void seedDefaultsForCompany_skipsExistingDates() {
        when(repository.existsByCompanyIdAndHolidayDate(eq(COMPANY_ID), any())).thenReturn(true);
        service.seedDefaultsForCompany(COMPANY_ID);
        verify(repository, never()).save(any());
    }

    @Test
    void seedDefaultsForCompany_savesNewDates() {
        when(repository.existsByCompanyIdAndHolidayDate(eq(COMPANY_ID), any())).thenReturn(false);
        service.seedDefaultsForCompany(COMPANY_ID);
        verify(repository, times(16)).save(any(PublicHoliday.class)); // 8 per year × 2 years
    }
}
