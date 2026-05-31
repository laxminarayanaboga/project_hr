package com.hrapp.leaveapproval;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.leaveapproval.dto.ApprovalChainResponse;
import com.hrapp.leaveapproval.dto.ApprovalStepRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave-types/{leaveTypeId}/approval-chain")
@RequiredArgsConstructor
public class LeaveApprovalController {

    private final LeaveApprovalService leaveApprovalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApprovalChainResponse>>> getChain(@PathVariable UUID leaveTypeId) {
        return ResponseEntity.ok(ApiResponse.success(
                leaveApprovalService.getChain(leaveTypeId), "Approval chain retrieved"));
    }

    @PutMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<List<ApprovalChainResponse>>> setChain(
            @PathVariable UUID leaveTypeId,
            @Valid @RequestBody List<ApprovalStepRequest> steps) {
        if (steps.size() > 3) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("TOO_MANY_STEPS", "Maximum 3 approval levels are allowed"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                leaveApprovalService.setChain(leaveTypeId, steps), "Approval chain updated"));
    }
}
