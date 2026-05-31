package com.hrapp.document;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.document.dto.DocumentResponse;
import com.hrapp.document.dto.DownloadUrlResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/api/v1/documents/upload")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam("employeeId") UUID employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "name", required = false) String name) throws IOException {
        DocumentResponse doc = documentService.upload(employeeId, file, type, name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(doc, "Document uploaded"));
    }

    @GetMapping("/api/v1/employees/{employeeId}/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> list(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.success(
                documentService.listByEmployee(employeeId), "Documents retrieved"));
    }

    @GetMapping("/api/v1/documents/{id}/download")
    public ResponseEntity<ApiResponse<DownloadUrlResponse>> getDownloadUrl(
            @PathVariable UUID id, HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        return ResponseEntity.ok(ApiResponse.success(
                documentService.getDownloadUrl(id, baseUrl), "Download URL generated"));
    }

    @GetMapping("/api/v1/documents/{id}/file")
    public ResponseEntity<InputStreamResource> serveFile(
            @PathVariable UUID id,
            @RequestParam String token,
            @RequestParam long expires) throws IOException {
        InputStream stream = documentService.openStream(id, token, expires);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(stream));
    }

    @DeleteMapping("/api/v1/documents/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) throws IOException {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Document deleted"));
    }
}
