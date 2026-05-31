package com.hrapp.leaverequest;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.leaverequest.dto.ApproveRejectRequest;
import com.hrapp.leaverequest.dto.CreateLeaveRequestRequest;
import com.hrapp.leaverequest.dto.LeaveRequestResponse;
import com.hrapp.leaverequest.dto.TeamLeaveEntry;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submit(@Valid @RequestBody CreateLeaveRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(leaveRequestService.submit(request), "Leave request submitted"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> myRequests() {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.getMyRequests(), "Leave requests retrieved"));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.getPendingForManager(), "Pending requests retrieved"));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TeamLeaveEntry>>> teamCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.getTeamCalendar(from, to), "Team calendar retrieved"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) ApproveRejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                leaveRequestService.approve(id, request != null ? request : new ApproveRejectRequest(null)),
                "Leave request approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reject(
            @PathVariable UUID id,
            @RequestBody ApproveRejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.reject(id, request), "Leave request rejected"));
    }

    @PostMapping("/{id}/override")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> override(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(leaveRequestService.overrideApprove(id), "Leave request approved by override"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable UUID id) {
        leaveRequestService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave request cancelled"));
    }
}
