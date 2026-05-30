package com.hrapp.employee;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.response.PageResponse;
import com.hrapp.department.DepartmentRepository;
import com.hrapp.employee.dto.CreateEmployeeRequest;
import com.hrapp.employee.dto.DeactivateRequest;
import com.hrapp.employee.dto.EmployeeResponse;
import com.hrapp.employee.dto.UpdateEmployeeRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock EmployeeRepository employeeRepository;
    @Mock DepartmentRepository departmentRepository;

    @InjectMocks EmployeeService employeeService;

    private final UUID COMPANY_ID  = UUID.randomUUID();
    private final UUID EMPLOYEE_ID = UUID.randomUUID();
    private Employee emp;

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        emp = new Employee();
        emp.setId(EMPLOYEE_ID);
        emp.setCompanyId(COMPANY_ID);
        emp.setFirstName("Jane");
        emp.setLastName("Smith");
        emp.setEmploymentStatus("ACTIVE");
        emp.setStartDate(LocalDate.of(2026, 1, 15));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── create() ──────────────────────────────────────────────────────────────

    @Test
    void create_savesAndReturnsEmployee() {
        when(employeeRepository.countByCompanyId(COMPANY_ID)).thenReturn(0L);
        when(employeeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmployeeResponse result = employeeService.create(minimalRequest());

        assertThat(result.firstName()).isEqualTo("Jane");
        assertThat(result.lastName()).isEqualTo("Smith");
        assertThat(result.employmentStatus()).isEqualTo("ACTIVE");
        verify(employeeRepository).save(any());
    }

    @Test
    void create_autoGeneratesEmployeeNumber_whenNotProvided() {
        when(employeeRepository.countByCompanyId(COMPANY_ID)).thenReturn(4L);
        when(employeeRepository.save(any())).thenAnswer(inv -> {
            Employee e = inv.getArgument(0);
            assertThat(e.getEmployeeNumber()).matches("EMP-\\d{4}-\\d{4}");
            return e;
        });

        employeeService.create(minimalRequest());
    }

    @Test
    void create_usesProvidedEmployeeNumber() {
        when(employeeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmployeeResponse result = employeeService.create(new CreateEmployeeRequest(
                "Jane", "Smith", null, null, null, null, null, null, null,
                "EMP-CUSTOM", "Engineer", "FULL_TIME",
                LocalDate.of(2026, 1, 15), null, null, null, null));

        assertThat(result.employeeNumber()).isEqualTo("EMP-CUSTOM");
        verify(employeeRepository, never()).countByCompanyId(any());
    }

    @Test
    void create_throwsNotFound_whenDepartmentDoesNotBelongToCompany() {
        UUID deptId = UUID.randomUUID();
        when(departmentRepository.existsByIdAndCompanyId(deptId, COMPANY_ID)).thenReturn(false);

        assertThatThrownBy(() -> employeeService.create(new CreateEmployeeRequest(
                "Jane", "Smith", null, null, null, null, null, null, null,
                null, null, null, LocalDate.of(2026, 1, 15), null, null, deptId, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_throwsNotFound_whenManagerNotFound() {
        UUID managerId = UUID.randomUUID();
        when(employeeRepository.findByIdAndCompanyId(managerId, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.create(new CreateEmployeeRequest(
                "Jane", "Smith", null, null, null, null, null, null, null,
                null, null, null, LocalDate.of(2026, 1, 15), null, null, null, managerId)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── list() ────────────────────────────────────────────────────────────────

    @Test
    void list_returnsPagedResults() {
        when(employeeRepository.search(eq(COMPANY_ID), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(emp)));

        PageResponse<EmployeeResponse> result = employeeService.list(null, null, PageRequest.of(0, 20));

        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.hasNext()).isFalse();
    }

    @Test
    void list_returnsEmpty_whenNoEmployees() {
        when(employeeRepository.search(eq(COMPANY_ID), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponse<EmployeeResponse> result = employeeService.list("ACTIVE", null, PageRequest.of(0, 20));

        assertThat(result.content()).isEmpty();
        assertThat(result.totalElements()).isZero();
    }

    // ── get() ─────────────────────────────────────────────────────────────────

    @Test
    void get_returnsEmployee() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(emp));

        EmployeeResponse result = employeeService.get(EMPLOYEE_ID);

        assertThat(result.id()).isEqualTo(EMPLOYEE_ID);
        assertThat(result.firstName()).isEqualTo("Jane");
    }

    @Test
    void get_throwsNotFound_whenMissing() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.get(EMPLOYEE_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void get_throwsNotFound_whenBelongsToDifferentCompany() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.get(EMPLOYEE_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── update() ──────────────────────────────────────────────────────────────

    @Test
    void update_changesJobTitle() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(emp));
        when(employeeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmployeeResponse result = employeeService.update(EMPLOYEE_ID, new UpdateEmployeeRequest(
                null, null, null, null, null, null, null, null, null,
                null, "Senior Engineer", null, null, null, null, null, null));

        assertThat(result.jobTitle()).isEqualTo("Senior Engineer");
    }

    @Test
    void update_throwsNotFound_whenMissing() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.update(EMPLOYEE_ID, new UpdateEmployeeRequest(
                null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── deactivate() ──────────────────────────────────────────────────────────

    @Test
    void deactivate_setsStatusToTerminated() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(emp));
        when(employeeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        employeeService.deactivate(EMPLOYEE_ID, new DeactivateRequest("Resigned", LocalDate.of(2026, 6, 1)));

        assertThat(emp.getEmploymentStatus()).isEqualTo("TERMINATED");
        assertThat(emp.getEndDate()).isEqualTo(LocalDate.of(2026, 6, 1));
    }

    @Test
    void deactivate_usesTodayAsEndDate_whenNotProvided() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(emp));
        when(employeeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        employeeService.deactivate(EMPLOYEE_ID, new DeactivateRequest("Resigned", null));

        assertThat(emp.getEndDate()).isEqualTo(LocalDate.now());
    }

    @Test
    void deactivate_throwsBusiness_whenAlreadyTerminated() {
        emp.setEmploymentStatus("TERMINATED");
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.of(emp));

        assertThatThrownBy(() -> employeeService.deactivate(EMPLOYEE_ID, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already terminated");
    }

    @Test
    void deactivate_throwsNotFound_whenMissing() {
        when(employeeRepository.findByIdAndCompanyId(EMPLOYEE_ID, COMPANY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.deactivate(EMPLOYEE_ID, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CreateEmployeeRequest minimalRequest() {
        return new CreateEmployeeRequest(
                "Jane", "Smith", null, null, null, null, null, null, null,
                null, null, null, LocalDate.of(2026, 1, 15), null, null, null, null);
    }
}
