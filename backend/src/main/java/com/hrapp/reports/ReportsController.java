package com.hrapp.reports;

import com.hrapp.common.response.ApiResponse;
import com.hrapp.reports.dto.LeaveReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR_ADMIN')")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/leave")
    public ResponseEntity<ApiResponse<LeaveReportResponse>> getLeaveReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID leaveTypeId) {
        LeaveReportResponse report = reportsService.getLeaveReport(from, to, employeeId, departmentId, leaveTypeId);
        return ResponseEntity.ok(ApiResponse.success(report, "Leave report retrieved"));
    }

    @GetMapping("/leave/export")
    public ResponseEntity<byte[]> export(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID leaveTypeId,
            @RequestParam(defaultValue = "csv") String format) throws IOException {

        if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdf = reportsService.exportPdf(from, to, employeeId, departmentId, leaveTypeId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leave-report.pdf\"")
                    .body(pdf);
        }

        byte[] csv = reportsService.exportCsv(from, to, employeeId, departmentId, leaveTypeId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leave-report.csv\"")
                .body(csv);
    }
}
