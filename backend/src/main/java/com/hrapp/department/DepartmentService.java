package com.hrapp.department;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.department.dto.CreateDepartmentRequest;
import com.hrapp.department.dto.DepartmentResponse;
import com.hrapp.department.dto.UpdateDepartmentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> listDepartments() {
        return departmentRepository.findAllByCompanyIdOrderByName(TenantContext.getCurrentCompany())
                .stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        Department dept = new Department();
        dept.setCompanyId(companyId);
        dept.setName(request.name());
        dept.setDescription(request.description());
        if (request.parentId() != null) {
            dept.setParent(resolveParent(request.parentId(), companyId));
        }
        return DepartmentResponse.from(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentResponse updateDepartment(UUID id, UpdateDepartmentRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        Department dept = findOwned(id, companyId);
        dept.setName(request.name());
        dept.setDescription(request.description());
        if (request.parentId() == null) {
            dept.setParent(null);
        } else if (!request.parentId().equals(id)) {
            dept.setParent(resolveParent(request.parentId(), companyId));
        }
        return DepartmentResponse.from(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        UUID companyId = TenantContext.getCurrentCompany();
        Department dept = findOwned(id, companyId);
        if (departmentRepository.countActiveEmployees(id) > 0) {
            throw new BusinessException("DEPARTMENT_HAS_EMPLOYEES",
                    "Cannot delete a department with active employees");
        }
        departmentRepository.delete(dept);
    }

    private Department findOwned(UUID id, UUID companyId) {
        return departmentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    private Department resolveParent(UUID parentId, UUID companyId) {
        return departmentRepository.findByIdAndCompanyId(parentId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent department not found"));
    }
}
