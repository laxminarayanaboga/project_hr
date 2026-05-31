package com.hrapp.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.response.PageResponse;
import com.hrapp.employee.dto.EmployeeResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EmployeeControllerTest {

    @Mock EmployeeService employeeService;
    @InjectMocks EmployeeController employeeController;

    private MockMvc mvc;
    private ObjectMapper objectMapper;
    private final UUID EMP_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mvc = MockMvcBuilders
                .standaloneSetup(employeeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private EmployeeResponse stubEmployee(UUID id, String firstName, String lastName) {
        return new EmployeeResponse(id, UUID.randomUUID(), firstName, lastName,
                null, null, null, null, null, null, null,
                "EMP-2026-0001", "Software Engineer", "FULL_TIME", "ACTIVE",
                LocalDate.of(2026, 1, 15), null, null,
                null, null, null, null, null,
                Instant.now(), Instant.now());
    }

    private static final String VALID_CREATE_JSON =
            "{\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"startDate\":\"2026-01-15\",\"jobTitle\":\"Software Engineer\",\"employmentType\":\"FULL_TIME\"}";

    // ── POST /employees ───────────────────────────────────────────────────────

    @Test
    void create_201_onValidRequest() throws Exception {
        when(employeeService.create(any())).thenReturn(stubEmployee(EMP_ID, "Jane", "Smith"));

        mvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CREATE_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(EMP_ID.toString()))
                .andExpect(jsonPath("$.data.firstName").value("Jane"));
    }

    @Test
    void create_400_whenRequiredFieldsMissing() throws Exception {
        mvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"No\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void create_400_whenBodyMissing() throws Exception {
        mvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_404_whenDepartmentNotFound() throws Exception {
        when(employeeService.create(any()))
                .thenThrow(new ResourceNotFoundException("Department not found"));

        mvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CREATE_JSON))
                .andExpect(status().isNotFound());
    }

    // ── GET /employees ────────────────────────────────────────────────────────

    @Test
    void list_200_returnsPaginatedResults() throws Exception {
        PageResponse<EmployeeResponse> page = new PageResponse<>(
                List.of(stubEmployee(EMP_ID, "Jane", "Smith")), 1L, 1, false);
        when(employeeService.list(any(), any(), any(Pageable.class))).thenReturn(page);

        mvc.perform(get("/api/v1/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].firstName").value("Jane"))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.hasNext").value(false));
    }

    @Test
    void list_200_acceptsStatusAndSearchParams() throws Exception {
        PageResponse<EmployeeResponse> page = new PageResponse<>(List.of(), 0L, 0, false);
        when(employeeService.list(eq("ACTIVE"), eq("jane"), any(Pageable.class))).thenReturn(page);

        mvc.perform(get("/api/v1/employees?status=ACTIVE&search=jane"))
                .andExpect(status().isOk());

        verify(employeeService).list(eq("ACTIVE"), eq("jane"), any(Pageable.class));
    }

    // ── GET /employees/:id ────────────────────────────────────────────────────

    @Test
    void get_200_returnsEmployee() throws Exception {
        when(employeeService.get(EMP_ID)).thenReturn(stubEmployee(EMP_ID, "Jane", "Smith"));

        mvc.perform(get("/api/v1/employees/" + EMP_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(EMP_ID.toString()))
                .andExpect(jsonPath("$.data.firstName").value("Jane"));
    }

    @Test
    void get_404_whenNotFound() throws Exception {
        when(employeeService.get(EMP_ID))
                .thenThrow(new ResourceNotFoundException("Employee not found"));

        mvc.perform(get("/api/v1/employees/" + EMP_ID))
                .andExpect(status().isNotFound());
    }

    // ── PUT /employees/:id ────────────────────────────────────────────────────

    @Test
    void update_200_onValidRequest() throws Exception {
        EmployeeResponse updated = stubEmployee(EMP_ID, "Jane", "Smith");
        when(employeeService.update(eq(EMP_ID), any())).thenReturn(updated);

        mvc.perform(put("/api/v1/employees/" + EMP_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"jobTitle\":\"Senior Engineer\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void update_404_whenNotFound() throws Exception {
        when(employeeService.update(eq(EMP_ID), any()))
                .thenThrow(new ResourceNotFoundException("Employee not found"));

        mvc.perform(put("/api/v1/employees/" + EMP_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    // ── DELETE /employees/:id ─────────────────────────────────────────────────

    @Test
    void deactivate_200_onSuccess() throws Exception {
        doNothing().when(employeeService).deactivate(eq(EMP_ID), any());

        mvc.perform(delete("/api/v1/employees/" + EMP_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Resigned\",\"endDate\":\"2026-06-01\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deactivate_404_whenNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Employee not found"))
                .when(employeeService).deactivate(eq(EMP_ID), any());

        mvc.perform(delete("/api/v1/employees/" + EMP_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }
}
