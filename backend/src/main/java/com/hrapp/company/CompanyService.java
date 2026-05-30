package com.hrapp.company;

import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.company.dto.CompanyProfileResponse;
import com.hrapp.company.dto.UpdateCompanyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private static final Path UPLOAD_DIR = Paths.get("uploads/logos");

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public CompanyProfileResponse getProfile() {
        Company company = findCurrentCompany();
        return CompanyProfileResponse.from(company);
    }

    @Transactional
    public CompanyProfileResponse updateProfile(UpdateCompanyRequest request) {
        Company company = findCurrentCompany();
        company.setName(request.name());
        company.setPhone(request.phone());
        company.setAddress(request.address());
        if (request.country() != null && !request.country().isBlank()) {
            company.setCountry(request.country());
        }
        return CompanyProfileResponse.from(companyRepository.save(company));
    }

    @Transactional
    public CompanyProfileResponse uploadLogo(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".png";

        Files.createDirectories(UPLOAD_DIR);
        String filename = UUID.randomUUID() + ext;
        Path destination = UPLOAD_DIR.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        Company company = findCurrentCompany();
        company.setLogoUrl("/uploads/logos/" + filename);
        return CompanyProfileResponse.from(companyRepository.save(company));
    }

    private Company findCurrentCompany() {
        return companyRepository.findById(TenantContext.getCurrentCompany())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }
}
