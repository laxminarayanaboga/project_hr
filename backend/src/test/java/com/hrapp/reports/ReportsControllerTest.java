package com.hrapp.reports;

import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.reports.dto.LeaveReportResponse;
import com.hrapp.reports.dto.LeaveReportRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReportsControllerTest {

    @Mock ReportsService reportsService;
    @InjectMocks ReportsController controller;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private LeaveReportResponse stubReport() {
        LeaveReportRow row = new LeaveReportRow(
                UUID.randomUUID(), "Jane Smith", "EMP001", "Engineering",
                "Annual Leave", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 5),
                BigDecimal.valueOf(5), "APPROVED");
        return new LeaveReportResponse(
                List.of(row),
                Map.of("Annual Leave", BigDecimal.valueOf(5)),
                BigDecimal.valueOf(5));
    }

    @Test
    void getLeaveReport_returns200() throws Exception {
        when(reportsService.getLeaveReport(any(), any(), isNull(), isNull(), isNull()))
                .thenReturn(stubReport());

        mvc.perform(get("/api/v1/reports/leave")
                        .param("from", "2026-01-01")
                        .param("to", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rows[0].employeeName").value("Jane Smith"))
                .andExpect(jsonPath("$.data.grandTotal").value(5));
    }

    @Test
    void getLeaveReport_returns400_whenFromMissing() throws Exception {
        mvc.perform(get("/api/v1/reports/leave").param("to", "2026-12-31"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getLeaveReport_returns400_whenToMissing() throws Exception {
        mvc.perform(get("/api/v1/reports/leave").param("from", "2026-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void exportCsv_returns200_withCsvContentType() throws Exception {
        when(reportsService.exportCsv(any(), any(), isNull(), isNull(), isNull()))
                .thenReturn("Employee,Employee Number\nJane Smith,EMP001\n".getBytes());

        mvc.perform(get("/api/v1/reports/leave/export")
                        .param("from", "2026-01-01")
                        .param("to", "2026-12-31")
                        .param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"leave-report.csv\""));
    }

    @Test
    void exportPdf_returns200_withPdfContentType() throws Exception {
        when(reportsService.exportPdf(any(), any(), isNull(), isNull(), isNull()))
                .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46});

        mvc.perform(get("/api/v1/reports/leave/export")
                        .param("from", "2026-01-01")
                        .param("to", "2026-12-31")
                        .param("format", "pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"leave-report.pdf\""));
    }
}
