package com.hrapp.company;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.company.dto.CompanyProfileResponse;
import com.hrapp.company.dto.UpdateCompanyRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getProfile(), "Company profile retrieved"));
    }

    @PutMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyService.updateProfile(request), "Company profile updated"));
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> uploadLogo(
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(companyService.uploadLogo(file), "Logo uploaded successfully"));
    }
}
