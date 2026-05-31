package com.hrapp.leavetype;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.leavetype.dto.CreateLeaveTypeRequest;
import com.hrapp.leavetype.dto.LeaveTypeResponse;
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
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class LeaveTypeControllerTest {

    @Mock LeaveTypeService leaveTypeService;
    @InjectMocks LeaveTypeController controller;

    private MockMvc mvc;
    private final ObjectMapper mapper = new ObjectMapper();
    private final UUID LT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private LeaveTypeResponse stubResponse() {
        return new LeaveTypeResponse(LT_ID, "Annual Leave", BigDecimal.valueOf(28),
                AccrualMethod.IMMEDIATE, true, true, true);
    }

    @Test
    void list_returns200WithLeaveTypes() throws Exception {
        when(leaveTypeService.list()).thenReturn(List.of(stubResponse()));
        mvc.perform(get("/api/v1/leave-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Annual Leave"));
    }

    @Test
    void create_returns201_withValidRequest() throws Exception {
        when(leaveTypeService.create(any())).thenReturn(stubResponse());
        CreateLeaveTypeRequest req = new CreateLeaveTypeRequest(
                "Annual Leave", BigDecimal.valueOf(28), AccrualMethod.IMMEDIATE, true, true);

        mvc.perform(post("/api/v1/leave-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Annual Leave"));
    }

    @Test
    void create_returns400_whenNameBlank() throws Exception {
        CreateLeaveTypeRequest req = new CreateLeaveTypeRequest(
                "", BigDecimal.valueOf(28), AccrualMethod.IMMEDIATE, true, true);
        mvc.perform(post("/api/v1/leave-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_returns200() throws Exception {
        mvc.perform(delete("/api/v1/leave-types/" + LT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
