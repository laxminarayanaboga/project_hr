package com.hrapp.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.attendance.dto.AttendanceRecordResponse;
import com.hrapp.attendance.dto.OvertimeRecordResponse;
import com.hrapp.attendance.dto.TodayStatusResponse;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AttendanceControllerTest {

    @Mock AttendanceService attendanceService;
    @InjectMocks AttendanceController controller;

    private MockMvc mvc;
    private final ObjectMapper mapper = new ObjectMapper();
    private final UUID EMP_ID = UUID.randomUUID();
    private final UUID REC_ID = UUID.randomUUID();
    private final UUID OT_ID  = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private AttendanceRecordResponse activeRecord() {
        return new AttendanceRecordResponse(REC_ID, EMP_ID, Instant.now(), null, null, true);
    }

    private AttendanceRecordResponse completedRecord() {
        return new AttendanceRecordResponse(REC_ID, EMP_ID, Instant.now().minusSeconds(3600),
                Instant.now(), BigDecimal.valueOf(1.00), false);
    }

    @Test
    void clockIn_returns200() throws Exception {
        when(attendanceService.clockIn()).thenReturn(activeRecord());
        mvc.perform(post("/api/v1/attendance/clock-in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(true));
    }

    @Test
    void clockIn_whenAlreadyClockedIn_returns409() throws Exception {
        when(attendanceService.clockIn()).thenThrow(
                new BusinessException("ALREADY_CLOCKED_IN", "You already have an active clock-in session"));
        mvc.perform(post("/api/v1/attendance/clock-in"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void clockOut_returns200() throws Exception {
        when(attendanceService.clockOut()).thenReturn(completedRecord());
        mvc.perform(post("/api/v1/attendance/clock-out"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false))
                .andExpect(jsonPath("$.data.hoursWorked").value(1.00));
    }

    @Test
    void clockOut_whenNotClockedIn_returns409() throws Exception {
        when(attendanceService.clockOut()).thenThrow(
                new BusinessException("NOT_CLOCKED_IN", "No active clock-in session found"));
        mvc.perform(post("/api/v1/attendance/clock-out"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void today_returns200() throws Exception {
        when(attendanceService.todayStatus()).thenReturn(
                new TodayStatusResponse(true, REC_ID, Instant.now(), null));
        mvc.perform(get("/api/v1/attendance/today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(true));
    }

    @Test
    void history_returns200() throws Exception {
        when(attendanceService.history(anyInt(), anyInt())).thenReturn(List.of());
        mvc.perform(get("/api/v1/attendance/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void overtime_returns200() throws Exception {
        OvertimeRecordResponse ot = new OvertimeRecordResponse(
                OT_ID, EMP_ID, "Jane Doe", LocalDate.now(),
                BigDecimal.valueOf(10), BigDecimal.valueOf(8), BigDecimal.valueOf(2),
                OvertimeStatus.PENDING, null);
        when(attendanceService.getTeamOvertime(any())).thenReturn(List.of(ot));
        mvc.perform(get("/api/v1/attendance/overtime"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].overtimeHours").value(2));
    }

    @Test
    void approveOvertime_returns200() throws Exception {
        OvertimeRecordResponse approved = new OvertimeRecordResponse(
                OT_ID, EMP_ID, "Jane Doe", LocalDate.now(),
                BigDecimal.valueOf(10), BigDecimal.valueOf(8), BigDecimal.valueOf(2),
                OvertimeStatus.APPROVED, Instant.now());
        when(attendanceService.approveOvertime(any(), any())).thenReturn(approved);
        mvc.perform(put("/api/v1/attendance/overtime/" + OT_ID + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"action\":\"APPROVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    void approveOvertime_invalidAction_returns422() throws Exception {
        when(attendanceService.approveOvertime(any(), any())).thenThrow(
                new BusinessException("INVALID_ACTION", "Action must be APPROVE or REJECT"));
        mvc.perform(put("/api/v1/attendance/overtime/" + OT_ID + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"action\":\"DENY\"}"))
                .andExpect(status().isBadRequest());
    }
}
