package com.hrapp.company;

import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.company.dto.CompanyProfileResponse;
import com.hrapp.company.dto.UpdateCompanyRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    CompanyRepository companyRepository;

    @InjectMocks
    CompanyService companyService;

    private final UUID COMPANY_ID = UUID.randomUUID();
    private Company company;

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);

        company = new Company();
        company.setId(COMPANY_ID);
        company.setName("Acme Corp");
        company.setSlug("acme-corp");
        company.setEmail("hr@acme.com");
        company.setPhone("+44 20 7946 0958");
        company.setAddress("123 London Road");
        company.setCountry("United Kingdom");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── getProfile() ──────────────────────────────────────────────────────────

    @Test
    void getProfile_returnsCompanyData() {
        when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));

        CompanyProfileResponse response = companyService.getProfile();

        assertThat(response.name()).isEqualTo("Acme Corp");
        assertThat(response.email()).isEqualTo("hr@acme.com");
        assertThat(response.country()).isEqualTo("United Kingdom");
    }

    @Test
    void getProfile_throwsNotFound_whenCompanyMissing() {
        when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> companyService.getProfile())
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── updateProfile() ───────────────────────────────────────────────────────

    @Test
    void updateProfile_updatesEditableFields() {
        when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateCompanyRequest request = new UpdateCompanyRequest("New Name", "+44 800 123", "99 High St", "Scotland");

        CompanyProfileResponse response = companyService.updateProfile(request);

        assertThat(response.name()).isEqualTo("New Name");
        assertThat(response.phone()).isEqualTo("+44 800 123");
        assertThat(response.address()).isEqualTo("99 High St");
        assertThat(response.country()).isEqualTo("Scotland");
    }

    @Test
    void updateProfile_keepsCountry_whenBlankProvided() {
        when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateCompanyRequest request = new UpdateCompanyRequest("New Name", null, null, "  ");

        CompanyProfileResponse response = companyService.updateProfile(request);

        assertThat(response.country()).isEqualTo("United Kingdom");
    }

    // ── uploadLogo() ──────────────────────────────────────────────────────────

    @Test
    void uploadLogo_savesFileAndUpdatesLogoUrl() throws IOException {
        when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "fake-image-bytes".getBytes());

        CompanyProfileResponse response = companyService.uploadLogo(file);

        assertThat(response.logoUrl()).startsWith("/uploads/logos/");
        assertThat(response.logoUrl()).endsWith(".png");
    }

    @Test
    void uploadLogo_rejectsNonImageFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malware.exe", "application/octet-stream", "bytes".getBytes());

        assertThatThrownBy(() -> companyService.uploadLogo(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("image");
    }
}
