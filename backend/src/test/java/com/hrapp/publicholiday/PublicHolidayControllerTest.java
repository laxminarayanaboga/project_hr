package com.hrapp.publicholiday;

import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.publicholiday.dto.PublicHolidayResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PublicHolidayControllerTest {

    @Mock PublicHolidayService service;
    @InjectMocks PublicHolidayController controller;

    private MockMvc mvc;
    private final UUID PH_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private PublicHolidayResponse stub() {
        return new PublicHolidayResponse(PH_ID, "Christmas Day", LocalDate.of(2026, 12, 25));
    }

    @Test
    void list_returns200() throws Exception {
        when(service.list()).thenReturn(List.of(stub()));
        mvc.perform(get("/api/v1/public-holidays"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Christmas Day"));
    }

    @Test
    void create_returns201() throws Exception {
        when(service.create(any())).thenReturn(stub());
        mvc.perform(post("/api/v1/public-holidays")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Christmas Day\",\"holidayDate\":\"2026-12-25\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Christmas Day"));
    }

    @Test
    void create_returns400_whenNameBlank() throws Exception {
        mvc.perform(post("/api/v1/public-holidays")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"holidayDate\":\"2026-12-25\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_returns200() throws Exception {
        mvc.perform(delete("/api/v1/public-holidays/" + PH_ID))
                .andExpect(status().isOk());
    }
}
