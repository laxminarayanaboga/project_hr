package com.hrapp.department;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.GlobalExceptionHandler;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.department.dto.CreateDepartmentRequest;
import com.hrapp.department.dto.DepartmentResponse;
import com.hrapp.department.dto.UpdateDepartmentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DepartmentControllerTest {

    @Mock
    DepartmentService departmentService;

    @InjectMocks
    DepartmentController departmentController;

    private MockMvc mvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UUID DEPT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders
                .standaloneSetup(departmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private DepartmentResponse stubDept(UUID id, String name, UUID parentId, String parentName) {
        return new DepartmentResponse(id, name, "A team", parentId, parentName);
    }

    // ── GET /departments ──────────────────────────────────────────────────────

    @Test
    void list_200_returnsDepartments() throws Exception {
        when(departmentService.listDepartments()).thenReturn(
                List.of(stubDept(DEPT_ID, "Engineering", null, null)));

        mvc.perform(get("/api/v1/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Engineering"))
                .andExpect(jsonPath("$.data[0].parentId").doesNotExist());
    }

    @Test
    void list_200_returnsEmpty() throws Exception {
        when(departmentService.listDepartments()).thenReturn(List.of());

        mvc.perform(get("/api/v1/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    // ── POST /departments ─────────────────────────────────────────────────────

    @Test
    void create_201_onValidRequest() throws Exception {
        when(departmentService.createDepartment(any())).thenReturn(stubDept(DEPT_ID, "Marketing", null, null));

        mvc.perform(post("/api/v1/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateDepartmentRequest("Marketing", "GTM team", null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Marketing"));
    }

    @Test
    void create_400_whenNameBlank() throws Exception {
        mvc.perform(post("/api/v1/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void create_404_whenParentNotFound() throws Exception {
        when(departmentService.createDepartment(any()))
                .thenThrow(new ResourceNotFoundException("Parent department not found"));

        mvc.perform(post("/api/v1/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateDepartmentRequest("Sub", null, UUID.randomUUID()))))
                .andExpect(status().isNotFound());
    }

    // ── PUT /departments/{id} ─────────────────────────────────────────────────

    @Test
    void update_200_onValidRequest() throws Exception {
        when(departmentService.updateDepartment(eq(DEPT_ID), any()))
                .thenReturn(stubDept(DEPT_ID, "R&D", null, null));

        mvc.perform(put("/api/v1/departments/" + DEPT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateDepartmentRequest("R&D", null, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("R&D"));
    }

    @Test
    void update_404_whenNotFound() throws Exception {
        when(departmentService.updateDepartment(eq(DEPT_ID), any()))
                .thenThrow(new ResourceNotFoundException("Department not found"));

        mvc.perform(put("/api/v1/departments/" + DEPT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateDepartmentRequest("X", null, null))))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_400_whenNameBlank() throws Exception {
        mvc.perform(put("/api/v1/departments/" + DEPT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── DELETE /departments/{id} ──────────────────────────────────────────────

    @Test
    void delete_200_onSuccess() throws Exception {
        doNothing().when(departmentService).deleteDepartment(DEPT_ID);

        mvc.perform(delete("/api/v1/departments/" + DEPT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void delete_400_whenEmployeesAssigned() throws Exception {
        doThrow(new BusinessException("DEPARTMENT_HAS_EMPLOYEES", "Cannot delete a department with active employees"))
                .when(departmentService).deleteDepartment(DEPT_ID);

        mvc.perform(delete("/api/v1/departments/" + DEPT_ID))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("DEPARTMENT_HAS_EMPLOYEES"));
    }

    @Test
    void delete_404_whenNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Department not found"))
                .when(departmentService).deleteDepartment(DEPT_ID);

        mvc.perform(delete("/api/v1/departments/" + DEPT_ID))
                .andExpect(status().isNotFound());
    }
}
