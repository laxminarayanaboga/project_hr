package com.hrapp.publicholiday;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.publicholiday.dto.CreatePublicHolidayRequest;
import com.hrapp.publicholiday.dto.PublicHolidayResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public-holidays")
@RequiredArgsConstructor
public class PublicHolidayController {

    private final PublicHolidayService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PublicHolidayResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(service.list(), "Public holidays retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<PublicHolidayResponse>> create(@Valid @RequestBody CreatePublicHolidayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(request), "Public holiday created"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Public holiday deleted"));
    }
}
