package com.hrapp.leaverequest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.leaverequest.dto.ApproveRejectRequest;
import com.hrapp.leaverequest.dto.LeaveRequestResponse;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class LeaveRequestControllerTest {

    @Mock LeaveRequestService leaveRequestService;
    @InjectMocks LeaveRequestController controller;

    private MockMvc mvc;
    private final ObjectMapper mapper = new ObjectMapper();
    private final UUID LR_ID  = UUID.randomUUID();
    private final UUID EMP_ID = UUID.randomUUID();
    private final UUID LT_ID  = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private LeaveRequestResponse stub(LeaveStatus status) {
        return new LeaveRequestResponse(LR_ID, EMP_ID, "Jane Smith", LT_ID, "Annual Leave",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(3),
                BigDecimal.valueOf(3), "Holiday", status, null, Instant.now());
    }

    @Test
    void submit_returns201() throws Exception {
        when(leaveRequestService.submit(any())).thenReturn(stub(LeaveStatus.PENDING));
        mvc.perform(post("/api/v1/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"leaveTypeId\":\"" + LT_ID + "\",\"startDate\":\"2026-09-01\",\"endDate\":\"2026-09-05\",\"reason\":\"Holiday\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    void submit_returns400_whenLeaveTypeNull() throws Exception {
        mvc.perform(post("/api/v1/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"startDate\":\"2026-09-01\",\"endDate\":\"2026-09-05\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void myRequests_returns200() throws Exception {
        when(leaveRequestService.getMyRequests()).thenReturn(List.of(stub(LeaveStatus.PENDING)));
        mvc.perform(get("/api/v1/leaves/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].leaveTypeName").value("Annual Leave"));
    }

    @Test
    void approve_returns200() throws Exception {
        when(leaveRequestService.approve(any(), any())).thenReturn(stub(LeaveStatus.APPROVED));
        mvc.perform(put("/api/v1/leaves/" + LR_ID + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(new ApproveRejectRequest("Approved"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    void reject_returns200() throws Exception {
        when(leaveRequestService.reject(any(), any())).thenReturn(stub(LeaveStatus.REJECTED));
        mvc.perform(put("/api/v1/leaves/" + LR_ID + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(new ApproveRejectRequest("Not approved"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"));
    }
}
