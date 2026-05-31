package com.hrapp.leavebalance;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.response.ApiResponse;
import com.hrapp.leavebalance.dto.AdjustBalanceRequest;
import com.hrapp.leavebalance.dto.LeaveBalanceResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave-balances")
@RequiredArgsConstructor
public class LeaveBalanceController {

    private final LeaveBalanceService service;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> myBalances() {
        return ResponseEntity.ok(ApiResponse.success(service.getMyBalances(), "Balances retrieved"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> forEmployee(@RequestParam UUID employeeId) {
        UUID companyId = TenantContext.getCurrentCompany();
        return ResponseEntity.ok(ApiResponse.success(
                service.getBalancesForEmployee(employeeId, companyId), "Balances retrieved"));
    }

    @PutMapping("/{id}/adjust")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> adjust(
            @PathVariable UUID id,
            @Valid @RequestBody AdjustBalanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.adjust(id, request), "Balance adjusted"));
    }
}
