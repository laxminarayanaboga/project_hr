package com.hrapp.document;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.document.dto.DocumentResponse;
import com.hrapp.document.dto.DownloadUrlResponse;
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

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    @Mock DocumentService documentService;
    @InjectMocks DocumentController documentController;

    private MockMvc mvc;
    private final UUID EMP_ID = UUID.randomUUID();
    private final UUID DOC_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders
                .standaloneSetup(documentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private DocumentResponse stubDoc() {
        return new DocumentResponse(DOC_ID, EMP_ID, "contract.pdf", "CONTRACT", 1024L, "application/pdf", Instant.now());
    }

    // ── POST /documents/upload ────────────────────────────────────────────────

    @Test
    void upload_returns201_withDocumentResponse() throws Exception {
        when(documentService.upload(any(), any(), anyString(), anyString())).thenReturn(stubDoc());

        MockMultipartFile file = new MockMultipartFile("file", "contract.pdf", "application/pdf", new byte[100]);

        mvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("employeeId", EMP_ID.toString())
                        .param("type", "CONTRACT")
                        .param("name", "Employment Contract"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("contract.pdf"));
    }

    @Test
    void upload_returns404_whenEmployeeNotFound() throws Exception {
        when(documentService.upload(any(), any(), any(), any()))
                .thenThrow(new ResourceNotFoundException("Employee not found"));

        MockMultipartFile file = new MockMultipartFile("file", "f.pdf", "application/pdf", new byte[10]);

        mvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("employeeId", EMP_ID.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void upload_returns400_forInvalidFileType() throws Exception {
        when(documentService.upload(any(), any(), any(), any()))
                .thenThrow(new BusinessException("INVALID_FILE_TYPE", "Allowed types: PDF, DOC, DOCX, JPG, PNG"));

        MockMultipartFile file = new MockMultipartFile("file", "bad.exe", "application/octet-stream", new byte[10]);

        mvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("employeeId", EMP_ID.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_FILE_TYPE"));
    }

    // ── GET /employees/{id}/documents ─────────────────────────────────────────

    @Test
    void listDocuments_returns200_withDocumentList() throws Exception {
        when(documentService.listByEmployee(EMP_ID)).thenReturn(List.of(stubDoc()));

        mvc.perform(get("/api/v1/employees/{id}/documents", EMP_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].type").value("CONTRACT"));
    }

    @Test
    void listDocuments_returns404_whenEmployeeNotFound() throws Exception {
        when(documentService.listByEmployee(EMP_ID))
                .thenThrow(new ResourceNotFoundException("Employee not found"));

        mvc.perform(get("/api/v1/employees/{id}/documents", EMP_ID))
                .andExpect(status().isNotFound());
    }

    // ── GET /documents/{id}/download ──────────────────────────────────────────

    @Test
    void getDownloadUrl_returns200_withUrl() throws Exception {
        when(documentService.getDownloadUrl(eq(DOC_ID), anyString()))
                .thenReturn(new DownloadUrlResponse("http://localhost:8080/api/v1/documents/" + DOC_ID + "/file?token=abc&expires=9999", 9999L));

        mvc.perform(get("/api/v1/documents/{id}/download", DOC_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.downloadUrl").exists());
    }

    @Test
    void getDownloadUrl_returns404_whenNotFound() throws Exception {
        when(documentService.getDownloadUrl(eq(DOC_ID), anyString()))
                .thenThrow(new ResourceNotFoundException("Document not found"));

        mvc.perform(get("/api/v1/documents/{id}/download", DOC_ID))
                .andExpect(status().isNotFound());
    }

    // ── GET /documents/{id}/file ──────────────────────────────────────────────

    @Test
    void serveFile_streamsContent_forValidToken() throws Exception {
        when(documentService.openStream(eq(DOC_ID), anyString(), anyLong()))
                .thenReturn(new ByteArrayInputStream("pdf-bytes".getBytes()));

        mvc.perform(get("/api/v1/documents/{id}/file", DOC_ID)
                        .param("token", "validtoken")
                        .param("expires", "9999999999999"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment"));
    }

    @Test
    void serveFile_returns400_forExpiredToken() throws Exception {
        when(documentService.openStream(any(), anyString(), anyLong()))
                .thenThrow(new BusinessException("INVALID_TOKEN", "Download link is invalid or expired"));

        mvc.perform(get("/api/v1/documents/{id}/file", DOC_ID)
                        .param("token", "expired")
                        .param("expires", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_TOKEN"));
    }

    // ── DELETE /documents/{id} ────────────────────────────────────────────────

    @Test
    void delete_returns200_onSuccess() throws Exception {
        mvc.perform(delete("/api/v1/documents/{id}", DOC_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void delete_returns404_whenNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Document not found")).when(documentService).delete(DOC_ID);

        mvc.perform(delete("/api/v1/documents/{id}", DOC_ID))
                .andExpect(status().isNotFound());
    }
}
