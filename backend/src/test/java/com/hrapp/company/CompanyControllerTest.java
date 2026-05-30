package com.hrapp.company;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.company.dto.CompanyProfileResponse;
import com.hrapp.company.dto.UpdateCompanyRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CompanyControllerTest {

    @Mock
    CompanyService companyService;

    @InjectMocks
    CompanyController companyController;

    private MockMvc mvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UUID COMPANY_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders
                .standaloneSetup(companyController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private CompanyProfileResponse stubProfile() {
        return new CompanyProfileResponse(
                COMPANY_ID, "Acme Corp", "acme-corp", "hr@acme.com",
                "+44 20 7946 0958", "123 London Road", "United Kingdom", null
        );
    }

    // ── GET /company ──────────────────────────────────────────────────────────

    @Test
    void getProfile_200_returnsCompanyData() throws Exception {
        when(companyService.getProfile()).thenReturn(stubProfile());

        mvc.perform(get("/api/v1/company"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Acme Corp"))
                .andExpect(jsonPath("$.data.email").value("hr@acme.com"))
                .andExpect(jsonPath("$.data.country").value("United Kingdom"));
    }

    @Test
    void getProfile_404_whenCompanyNotFound() throws Exception {
        when(companyService.getProfile()).thenThrow(new ResourceNotFoundException("Company not found"));

        mvc.perform(get("/api/v1/company"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── PUT /company ──────────────────────────────────────────────────────────

    @Test
    void updateProfile_200_onValidRequest() throws Exception {
        CompanyProfileResponse updated = new CompanyProfileResponse(
                COMPANY_ID, "New Name", "acme-corp", "hr@acme.com",
                "+44 800 123", "99 High St", "Scotland", null
        );
        when(companyService.updateProfile(any())).thenReturn(updated);

        mvc.perform(put("/api/v1/company")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateCompanyRequest("New Name", "+44 800 123", "99 High St", "Scotland"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("New Name"))
                .andExpect(jsonPath("$.data.country").value("Scotland"));
    }

    @Test
    void updateProfile_400_whenNameBlank() throws Exception {
        mvc.perform(put("/api/v1/company")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"phone\":null,\"address\":null,\"country\":\"UK\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void updateProfile_400_whenBodyMissing() throws Exception {
        mvc.perform(put("/api/v1/company")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ── POST /company/logo ────────────────────────────────────────────────────

    @Test
    void uploadLogo_200_onValidImage() throws Exception {
        CompanyProfileResponse withLogo = new CompanyProfileResponse(
                COMPANY_ID, "Acme Corp", "acme-corp", "hr@acme.com",
                null, null, "United Kingdom", "/uploads/logos/abc.png"
        );
        when(companyService.uploadLogo(any())).thenReturn(withLogo);

        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "fake-bytes".getBytes());

        mvc.perform(multipart("/api/v1/company/logo").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.logoUrl").value("/uploads/logos/abc.png"));
    }

    @Test
    void uploadLogo_400_whenServiceRejectsFile() throws Exception {
        when(companyService.uploadLogo(any())).thenThrow(new IllegalArgumentException("File must be an image"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "bad.exe", "application/octet-stream", "bytes".getBytes());

        mvc.perform(multipart("/api/v1/company/logo").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
