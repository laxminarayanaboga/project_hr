package com.hrapp.document;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HexFormat;

@Service
public class LocalStorageService implements StorageService {

    private static final long EXPIRY_MS = 15 * 60 * 1000L;
    private static final Path BASE_DIR = Paths.get("uploads/documents");

    @Value("${app.jwt.secret}")
    private String secret;

    @Override
    public String store(MultipartFile file, String key) throws IOException {
        Path destination = BASE_DIR.resolve(key);
        Files.createDirectories(destination.getParent());
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return key;
    }

    @Override
    public String generateDownloadUrl(String key, String documentId, String baseUrl) {
        long expires = System.currentTimeMillis() + EXPIRY_MS;
        String payload = documentId + ":" + expires;
        String token = hmac(payload);
        return baseUrl + "/api/v1/documents/" + documentId + "/file?token=" + token + "&expires=" + expires;
    }

    @Override
    public InputStream openStream(String key) throws IOException {
        return Files.newInputStream(BASE_DIR.resolve(key));
    }

    @Override
    public void delete(String key) throws IOException {
        Files.deleteIfExists(BASE_DIR.resolve(key));
    }

    public boolean validateToken(String documentId, String token, long expires) {
        if (System.currentTimeMillis() > expires) return false;
        String expected = hmac(documentId + ":" + expires);
        return expected.equals(token);
    }

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("HMAC error", e);
        }
    }
}
