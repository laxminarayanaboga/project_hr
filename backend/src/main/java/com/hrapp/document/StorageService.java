package com.hrapp.document;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

public interface StorageService {

    /** Stores the file and returns the storage key. */
    String store(MultipartFile file, String key) throws IOException;

    /** Generates a time-limited download URL (simulates S3 pre-signed URL). */
    String generateDownloadUrl(String key, String documentId, String baseUrl);

    /** Opens an InputStream for the given storage key. */
    InputStream openStream(String key) throws IOException;

    /** Deletes the stored file. */
    void delete(String key) throws IOException;
}
