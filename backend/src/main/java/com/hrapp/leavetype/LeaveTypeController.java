package com.hrapp.leavetype;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.leavetype.dto.CreateLeaveTypeRequest;
import com.hrapp.leavetype.dto.LeaveTypeResponse;
import com.hrapp.leavetype.dto.UpdateLeaveTypeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(leaveTypeService.list(), "Leave types retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> create(@Valid @RequestBody CreateLeaveTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(leaveTypeService.create(request), "Leave type created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLeaveTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(leaveTypeService.update(id, request), "Leave type updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        leaveTypeService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave type deactivated"));
    }
}
