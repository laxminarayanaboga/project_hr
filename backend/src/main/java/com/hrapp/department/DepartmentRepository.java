package com.hrapp.department;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    List<Department> findAllByCompanyIdOrderByName(UUID companyId);

    Optional<Department> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByIdAndCompanyId(UUID id, UUID companyId);

    @Query(value = "SELECT COUNT(*) FROM employees WHERE department_id = :deptId AND employment_status != 'TERMINATED'",
            nativeQuery = true)
    long countActiveEmployees(@Param("deptId") UUID deptId);
}
