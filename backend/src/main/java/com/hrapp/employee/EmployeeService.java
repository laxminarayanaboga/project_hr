package com.hrapp.employee;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.response.PageResponse;
import com.hrapp.department.Department;
import com.hrapp.department.DepartmentRepository;
import com.hrapp.employee.dto.CreateEmployeeRequest;
import com.hrapp.employee.dto.DeactivateRequest;
import com.hrapp.employee.dto.EmployeeResponse;
import com.hrapp.employee.dto.UpdateEmployeeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();

        if (request.departmentId() != null) {
            validateDepartment(request.departmentId(), companyId);
        }
        if (request.managerId() != null) {
            validateManager(request.managerId(), companyId);
        }

        Employee employee = new Employee();
        employee.setCompanyId(companyId);
        applyFields(employee, request);

        if (employee.getEmployeeNumber() == null || employee.getEmployeeNumber().isBlank()) {
            employee.setEmployeeNumber(generateEmployeeNumber(companyId));
        }

        Employee saved = employeeRepository.save(employee);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> list(String status, UUID departmentId, String search, Pageable pageable) {
        UUID companyId = TenantContext.getCurrentCompany();
        Page<Employee> page = employeeRepository.search(companyId, status, departmentId, search, pageable);
        return PageResponse.of(page.map(e -> toResponse(e, batchDeptNames(page.getContent()), batchManagerNames(page.getContent()))));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(UUID id) {
        UUID companyId = TenantContext.getCurrentCompany();
        Employee employee = findOwned(id, companyId);
        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse update(UUID id, UpdateEmployeeRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        Employee employee = findOwned(id, companyId);

        if (request.departmentId() != null) {
            validateDepartment(request.departmentId(), companyId);
        }
        if (request.managerId() != null) {
            validateManager(request.managerId(), companyId);
        }

        applyFields(employee, request);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public void deactivate(UUID id, DeactivateRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        Employee employee = findOwned(id, companyId);

        if ("TERMINATED".equals(employee.getEmploymentStatus())) {
            throw new BusinessException("ALREADY_TERMINATED", "Employee is already terminated");
        }

        employee.setEmploymentStatus("TERMINATED");
        if (request != null && request.endDate() != null) {
            employee.setEndDate(request.endDate());
        } else {
            employee.setEndDate(LocalDate.now());
        }
        employeeRepository.save(employee);
    }

    private Employee findOwned(UUID id, UUID companyId) {
        return employeeRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    private void validateDepartment(UUID departmentId, UUID companyId) {
        if (!departmentRepository.existsByIdAndCompanyId(departmentId, companyId)) {
            throw new ResourceNotFoundException("Department not found");
        }
    }

    private void validateManager(UUID managerId, UUID companyId) {
        employeeRepository.findByIdAndCompanyId(managerId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
    }

    private String generateEmployeeNumber(UUID companyId) {
        long count = employeeRepository.countByCompanyId(companyId);
        return String.format("EMP-%d-%04d", LocalDate.now().getYear(), count + 1);
    }

    private void applyFields(Employee e, CreateEmployeeRequest r) {
        e.setFirstName(r.firstName());
        e.setLastName(r.lastName());
        e.setPreferredName(r.preferredName());
        e.setDateOfBirth(r.dateOfBirth());
        e.setGender(r.gender());
        e.setNationality(r.nationality());
        e.setPhone(r.phone());
        e.setPersonalEmail(r.personalEmail());
        e.setAddress(r.address());
        e.setEmployeeNumber(r.employeeNumber());
        e.setJobTitle(r.jobTitle());
        e.setEmploymentType(r.employmentType());
        e.setStartDate(r.startDate());
        e.setEndDate(r.endDate());
        e.setProbationEnd(r.probationEnd());
        e.setDepartmentId(r.departmentId());
        e.setManagerId(r.managerId());
    }

    private void applyFields(Employee e, UpdateEmployeeRequest r) {
        if (r.firstName() != null) e.setFirstName(r.firstName());
        if (r.lastName() != null) e.setLastName(r.lastName());
        if (r.preferredName() != null) e.setPreferredName(r.preferredName());
        if (r.dateOfBirth() != null) e.setDateOfBirth(r.dateOfBirth());
        if (r.gender() != null) e.setGender(r.gender());
        if (r.nationality() != null) e.setNationality(r.nationality());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.personalEmail() != null) e.setPersonalEmail(r.personalEmail());
        if (r.address() != null) e.setAddress(r.address());
        if (r.employeeNumber() != null) e.setEmployeeNumber(r.employeeNumber());
        if (r.jobTitle() != null) e.setJobTitle(r.jobTitle());
        if (r.employmentType() != null) e.setEmploymentType(r.employmentType());
        if (r.startDate() != null) e.setStartDate(r.startDate());
        if (r.endDate() != null) e.setEndDate(r.endDate());
        if (r.probationEnd() != null) e.setProbationEnd(r.probationEnd());
        e.setDepartmentId(r.departmentId());
        e.setManagerId(r.managerId());
    }

    private EmployeeResponse toResponse(Employee e) {
        String deptName = e.getDepartmentId() == null ? null :
                departmentRepository.findById(e.getDepartmentId())
                        .map(Department::getName).orElse(null);
        String managerName = e.getManagerId() == null ? null :
                employeeRepository.findById(e.getManagerId())
                        .map(m -> m.getFirstName() + " " + m.getLastName()).orElse(null);
        return EmployeeResponse.from(e, deptName, managerName);
    }

    private EmployeeResponse toResponse(Employee e, Map<UUID, String> deptNames, Map<UUID, String> managerNames) {
        return EmployeeResponse.from(e,
                e.getDepartmentId() != null ? deptNames.get(e.getDepartmentId()) : null,
                e.getManagerId() != null ? managerNames.get(e.getManagerId()) : null);
    }

    private Map<UUID, String> batchDeptNames(List<Employee> employees) {
        Set<UUID> ids = employees.stream()
                .map(Employee::getDepartmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return departmentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Department::getId, Department::getName));
    }

    private Map<UUID, String> batchManagerNames(List<Employee> employees) {
        Set<UUID> ids = employees.stream()
                .map(Employee::getManagerId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return employeeRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Employee::getId, m -> m.getFirstName() + " " + m.getLastName()));
    }
}
