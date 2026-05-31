package com.hrapp.dashboard;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.dashboard.dto.ManagerDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/manager-stats")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ManagerDashboardResponse>> getManagerStats() {
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getManagerStats(), "Manager dashboard stats retrieved"));
    }
}
