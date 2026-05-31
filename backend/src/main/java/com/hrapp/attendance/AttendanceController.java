package com.hrapp.attendance;

import com.hrapp.attendance.dto.ApproveOvertimeRequest;
import com.hrapp.attendance.dto.AttendanceRecordResponse;
import com.hrapp.attendance.dto.OvertimeRecordResponse;
import com.hrapp.attendance.dto.TodayStatusResponse;
import com.hrapp.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> clockIn() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.clockIn(), "Clocked in successfully"));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> clockOut() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.clockOut(), "Clocked out successfully"));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<TodayStatusResponse>> today() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.todayStatus(), "Today's status retrieved"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.history(page, size), "Attendance history retrieved"));
    }

    @GetMapping("/overtime")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<OvertimeRecordResponse>>> overtime(
            @RequestParam(required = false) UUID teamId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getTeamOvertime(teamId), "Overtime records retrieved"));
    }

    @PutMapping("/overtime/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<OvertimeRecordResponse>> approve(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveOvertimeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.approveOvertime(id, request.action()), "Overtime record updated"));
    }
}
