package com.hrapp.employee;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.common.response.PageResponse;
import com.hrapp.employee.dto.CreateEmployeeRequest;
import com.hrapp.employee.dto.DeactivateRequest;
import com.hrapp.employee.dto.EmployeeResponse;
import com.hrapp.employee.dto.UpdateEmployeeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employeeService.create(request), "Employee created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                employeeService.list(status, departmentId, search, PageRequest.of(page, size)),
                "Employees retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.get(id), "Employee retrieved"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable UUID id,
            @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.update(id, request), "Employee updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable UUID id,
            @RequestBody(required = false) DeactivateRequest request) {
        employeeService.deactivate(id, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee deactivated"));
    }

    @PostMapping("/{id}/avatar")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> uploadAvatar(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("NOT_IMPLEMENTED", "Avatar upload requires S3 — deferred to staging"));
    }
}
