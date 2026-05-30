package com.hrapp.department;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.department.dto.CreateDepartmentRequest;
import com.hrapp.department.dto.DepartmentResponse;
import com.hrapp.department.dto.OrgChartNodeDto;
import com.hrapp.department.dto.UpdateDepartmentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<OrgChartNodeDto> getOrgChart() {
        UUID companyId = TenantContext.getCurrentCompany();
        List<Department> allDepts = departmentRepository.findAllByCompanyIdOrderByName(companyId);

        Map<UUID, Long> countByDept = departmentRepository.countEmployeesGroupedByDepartment(companyId)
                .stream()
                .collect(Collectors.toMap(
                        row -> UUID.fromString(row[0].toString()),
                        row -> ((Number) row[1]).longValue()
                ));

        Map<UUID, OrgChartNodeDto> nodeMap = new LinkedHashMap<>();
        for (Department dept : allDepts) {
            nodeMap.put(dept.getId(), new OrgChartNodeDto(
                    dept.getId(),
                    dept.getName(),
                    dept.getDescription(),
                    countByDept.getOrDefault(dept.getId(), 0L),
                    new ArrayList<>()
            ));
        }

        List<OrgChartNodeDto> roots = new ArrayList<>();
        for (Department dept : allDepts) {
            OrgChartNodeDto node = nodeMap.get(dept.getId());
            if (dept.getParent() == null) {
                roots.add(node);
            } else {
                OrgChartNodeDto parentNode = nodeMap.get(dept.getParent().getId());
                if (parentNode != null) {
                    parentNode.children().add(node);
                } else {
                    roots.add(node);
                }
            }
        }

        return roots;
    }

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
