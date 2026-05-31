package com.hrapp.document;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.document.dto.DocumentResponse;
import com.hrapp.document.dto.DownloadUrlResponse;
import com.hrapp.employee.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final long MAX_SIZE = 10 * 1024 * 1024L;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png"
    );

    private final DocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final LocalStorageService storageService;

    @Transactional
    public DocumentResponse upload(UUID employeeId, MultipartFile file, String type, String name) throws IOException {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID uploadedBy = UserContext.getCurrentUser();

        if (!employeeRepository.existsByIdAndCompanyId(employeeId, companyId)) {
            throw new ResourceNotFoundException("Employee not found");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_TYPES.contains(mimeType)) {
            throw new BusinessException("INVALID_FILE_TYPE", "Allowed types: PDF, DOC, DOCX, JPG, PNG");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException("FILE_TOO_LARGE", "Maximum file size is 10MB");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
        String key = companyId + "/" + employeeId + "/" + UUID.randomUUID() + ext;

        storageService.store(file, key);

        Document doc = new Document();
        doc.setCompanyId(companyId);
        doc.setEmployeeId(employeeId);
        doc.setUploadedBy(uploadedBy);
        doc.setName(name != null && !name.isBlank() ? name : originalName);
        doc.setType(type);
        doc.setS3Key(key);
        doc.setFileSize(file.getSize());
        doc.setMimeType(mimeType);

        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listByEmployee(UUID employeeId) {
        UUID companyId = TenantContext.getCurrentCompany();
        if (!employeeRepository.existsByIdAndCompanyId(employeeId, companyId)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        return documentRepository
                .findByEmployeeIdAndCompanyIdOrderByCreatedAtDesc(employeeId, companyId)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadUrlResponse getDownloadUrl(UUID documentId, String baseUrl) {
        UUID companyId = TenantContext.getCurrentCompany();
        Document doc = findOwned(documentId, companyId);
        long expiresAt = System.currentTimeMillis() + 15 * 60 * 1000L;
        String url = storageService.generateDownloadUrl(doc.getS3Key(), documentId.toString(), baseUrl);
        return new DownloadUrlResponse(url, expiresAt);
    }

    @Transactional
    public void delete(UUID documentId) throws IOException {
        UUID companyId = TenantContext.getCurrentCompany();
        Document doc = findOwned(documentId, companyId);
        storageService.delete(doc.getS3Key());
        documentRepository.delete(doc);
    }

    public InputStream openStream(UUID documentId, String token, long expires) throws IOException {
        if (!storageService.validateToken(documentId.toString(), token, expires)) {
            throw new BusinessException("INVALID_TOKEN", "Download link is invalid or expired");
        }
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return storageService.openStream(doc.getS3Key());
    }

    private Document findOwned(UUID id, UUID companyId) {
        return documentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }
}
