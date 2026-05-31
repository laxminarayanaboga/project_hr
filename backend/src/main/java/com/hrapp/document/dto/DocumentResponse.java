package com.hrapp.document.dto;

import com.hrapp.document.Document;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        UUID employeeId,
        String name,
        String type,
        Long fileSize,
        String mimeType,
        Instant createdAt
) {
    public static DocumentResponse from(Document d) {
        return new DocumentResponse(
                d.getId(),
                d.getEmployeeId(),
                d.getName(),
                d.getType(),
                d.getFileSize(),
                d.getMimeType(),
                d.getCreatedAt()
        );
    }
}
