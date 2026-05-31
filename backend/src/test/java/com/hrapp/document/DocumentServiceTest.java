package com.hrapp.document;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.document.dto.DocumentResponse;
import com.hrapp.employee.EmployeeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock DocumentRepository documentRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock LocalStorageService storageService;

    @InjectMocks DocumentService documentService;

    private final UUID COMPANY_ID = UUID.randomUUID();
    private final UUID USER_ID    = UUID.randomUUID();
    private final UUID EMP_ID     = UUID.randomUUID();
    private final UUID DOC_ID     = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        UserContext.setCurrentUser(USER_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        UserContext.clear();
    }

    // ── upload() ──────────────────────────────────────────────────────────────

    @Test
    void upload_storesFileAndSavesMetadata() throws IOException {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(true);
        when(storageService.store(any(), anyString())).thenReturn("some/key.pdf");
        when(documentRepository.save(any())).thenAnswer(inv -> {
            Document d = inv.getArgument(0);
            d.setId(DOC_ID);
            d.setCreatedAt(Instant.now());
            return d;
        });

        MockMultipartFile file = new MockMultipartFile("file", "contract.pdf", "application/pdf", new byte[100]);
        DocumentResponse result = documentService.upload(EMP_ID, file, "CONTRACT", "Employment Contract");

        assertThat(result.name()).isEqualTo("Employment Contract");
        assertThat(result.mimeType()).isEqualTo("application/pdf");
        assertThat(result.type()).isEqualTo("CONTRACT");
        verify(storageService).store(any(), anyString());
        verify(documentRepository).save(any());
    }

    @Test
    void upload_throwsNotFound_whenEmployeeMissing() {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(false);
        MockMultipartFile file = new MockMultipartFile("file", "f.pdf", "application/pdf", new byte[10]);

        assertThatThrownBy(() -> documentService.upload(EMP_ID, file, "CONTRACT", null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void upload_rejectsInvalidMimeType() {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(true);
        MockMultipartFile file = new MockMultipartFile("file", "malware.exe", "application/octet-stream", new byte[10]);

        assertThatThrownBy(() -> documentService.upload(EMP_ID, file, "OTHER", null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Allowed types");
    }

    @Test
    void upload_rejectsFileExceeding10MB() {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(true);
        MockMultipartFile file = new MockMultipartFile("file", "big.pdf", "application/pdf", new byte[11 * 1024 * 1024]);

        assertThatThrownBy(() -> documentService.upload(EMP_ID, file, "CONTRACT", null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("10MB");
    }

    @Test
    void upload_usesOriginalFilename_whenNameNotProvided() throws IOException {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(true);
        when(storageService.store(any(), anyString())).thenReturn("key.pdf");
        when(documentRepository.save(any())).thenAnswer(inv -> {
            Document d = inv.getArgument(0);
            d.setId(DOC_ID);
            d.setCreatedAt(Instant.now());
            return d;
        });

        MockMultipartFile file = new MockMultipartFile("file", "passport.pdf", "application/pdf", new byte[100]);
        DocumentResponse result = documentService.upload(EMP_ID, file, "ID", null);

        assertThat(result.name()).isEqualTo("passport.pdf");
    }

    // ── listByEmployee() ──────────────────────────────────────────────────────

    @Test
    void listByEmployee_returnsDocs() {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(true);

        Document doc = new Document();
        doc.setId(DOC_ID);
        doc.setEmployeeId(EMP_ID);
        doc.setName("CV.pdf");
        doc.setMimeType("application/pdf");
        doc.setCreatedAt(Instant.now());

        when(documentRepository.findByEmployeeIdAndCompanyIdOrderByCreatedAtDesc(EMP_ID, COMPANY_ID))
                .thenReturn(List.of(doc));

        List<DocumentResponse> result = documentService.listByEmployee(EMP_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("CV.pdf");
    }

    @Test
    void listByEmployee_throwsNotFound_whenEmployeeMissing() {
        when(employeeRepository.existsByIdAndCompanyId(EMP_ID, COMPANY_ID)).thenReturn(false);

        assertThatThrownBy(() -> documentService.listByEmployee(EMP_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── delete() ──────────────────────────────────────────────────────────────

    @Test
    void delete_removesFileAndRecord() throws IOException {
        Document doc = new Document();
        doc.setId(DOC_ID);
        doc.setS3Key("some/key.pdf");

        when(documentRepository.findByIdAndCompanyId(DOC_ID, COMPANY_ID)).thenReturn(Optional.of(doc));

        documentService.delete(DOC_ID);

        verify(storageService).delete("some/key.pdf");
        verify(documentRepository).delete(doc);
    }

    @Test
    void delete_throwsNotFound_whenDocumentMissing() {
        when(documentRepository.findByIdAndCompanyId(DOC_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.delete(DOC_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
