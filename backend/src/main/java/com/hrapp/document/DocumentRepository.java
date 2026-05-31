package com.hrapp.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByEmployeeIdAndCompanyIdOrderByCreatedAtDesc(UUID employeeId, UUID companyId);

    Optional<Document> findByIdAndCompanyId(UUID id, UUID companyId);
}
