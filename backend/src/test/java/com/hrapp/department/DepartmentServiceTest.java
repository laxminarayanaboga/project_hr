package com.hrapp.department;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.department.dto.CreateDepartmentRequest;
import com.hrapp.department.dto.DepartmentResponse;
import com.hrapp.department.dto.UpdateDepartmentRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    DepartmentRepository departmentRepository;

    @InjectMocks
    DepartmentService departmentService;

    private final UUID COMPANY_ID = UUID.randomUUID();
    private final UUID DEPT_ID = UUID.randomUUID();
    private Department dept;

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        dept = new Department();
        dept.setId(DEPT_ID);
        dept.setCompanyId(COMPANY_ID);
        dept.setName("Engineering");
        dept.setDescription("Builds the product");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── listDepartments() ─────────────────────────────────────────────────────

    @Test
    void list_returnsAllForCompany() {
        when(departmentRepository.findAllByCompanyIdOrderByName(COMPANY_ID)).thenReturn(List.of(dept));

        List<DepartmentResponse> result = departmentService.listDepartments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Engineering");
    }

    @Test
    void list_returnsEmpty_whenNone() {
        when(departmentRepository.findAllByCompanyIdOrderByName(COMPANY_ID)).thenReturn(List.of());

        assertThat(departmentService.listDepartments()).isEmpty();
    }

    // ── createDepartment() ────────────────────────────────────────────────────

    @Test
    void create_savesAndReturnsDepartment() {
        when(departmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepartmentResponse result = departmentService.createDepartment(
                new CreateDepartmentRequest("Marketing", "Go-to-market", null));

        assertThat(result.name()).isEqualTo("Marketing");
        assertThat(result.description()).isEqualTo("Go-to-market");
        assertThat(result.parentId()).isNull();
        verify(departmentRepository).save(any());
    }

    @Test
    void create_withParent_setsParent() {
        UUID parentId = UUID.randomUUID();
        Department parent = new Department();
        parent.setId(parentId);
        parent.setCompanyId(COMPANY_ID);
        parent.setName("Tech");

        when(departmentRepository.findByIdAndCompanyId(parentId, COMPANY_ID)).thenReturn(Optional.of(parent));
        when(departmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepartmentResponse result = departmentService.createDepartment(
                new CreateDepartmentRequest("Frontend", null, parentId));

        assertThat(result.parentId()).isEqualTo(parentId);
        assertThat(result.parentName()).isEqualTo("Tech");
    }

    @Test
    void create_throwsNotFound_whenParentMissing() {
        UUID parentId = UUID.randomUUID();
        when(departmentRepository.findByIdAndCompanyId(parentId, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.createDepartment(
                new CreateDepartmentRequest("Sub", null, parentId)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── updateDepartment() ────────────────────────────────────────────────────

    @Test
    void update_changesNameAndDescription() {
        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.of(dept));
        when(departmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepartmentResponse result = departmentService.updateDepartment(DEPT_ID,
                new UpdateDepartmentRequest("R&D", "Research team", null));

        assertThat(result.name()).isEqualTo("R&D");
        assertThat(result.parentId()).isNull();
    }

    @Test
    void update_clearsParent_whenParentIdNull() {
        Department parent = new Department();
        parent.setId(UUID.randomUUID());
        parent.setName("Parent");
        dept.setParent(parent);

        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.of(dept));
        when(departmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DepartmentResponse result = departmentService.updateDepartment(DEPT_ID,
                new UpdateDepartmentRequest("Engineering", null, null));

        assertThat(result.parentId()).isNull();
    }

    @Test
    void update_ignoresSelfAsParent() {
        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.of(dept));
        when(departmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        departmentService.updateDepartment(DEPT_ID,
                new UpdateDepartmentRequest("Engineering", null, DEPT_ID));

        // called once to load the dept itself, not a second time to resolve self as parent
        verify(departmentRepository, times(1)).findByIdAndCompanyId(DEPT_ID, COMPANY_ID);
    }

    @Test
    void update_throwsNotFound_whenDeptMissing() {
        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.updateDepartment(DEPT_ID,
                new UpdateDepartmentRequest("X", null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── deleteDepartment() ────────────────────────────────────────────────────

    @Test
    void delete_removesWhenNoActiveEmployees() {
        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.of(dept));
        when(departmentRepository.countActiveEmployees(DEPT_ID)).thenReturn(0L);

        departmentService.deleteDepartment(DEPT_ID);

        verify(departmentRepository).delete(dept);
    }

    @Test
    void delete_throwsBusinessException_whenEmployeesAssigned() {
        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.of(dept));
        when(departmentRepository.countActiveEmployees(DEPT_ID)).thenReturn(3L);

        assertThatThrownBy(() -> departmentService.deleteDepartment(DEPT_ID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("active employees");
    }

    @Test
    void delete_throwsNotFound_whenDeptMissing() {
        when(departmentRepository.findByIdAndCompanyId(DEPT_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.deleteDepartment(DEPT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
