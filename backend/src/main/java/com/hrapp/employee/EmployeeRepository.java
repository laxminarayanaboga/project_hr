package com.hrapp.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    @Query(value = """
            SELECT e FROM Employee e
            WHERE e.companyId = :companyId
            AND (:status IS NULL OR :status = '' OR e.employmentStatus = :status)
            AND (:search IS NULL OR :search = ''
                 OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.lastName)  LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY e.lastName ASC, e.firstName ASC
            """,
            countQuery = """
            SELECT COUNT(e) FROM Employee e
            WHERE e.companyId = :companyId
            AND (:status IS NULL OR :status = '' OR e.employmentStatus = :status)
            AND (:search IS NULL OR :search = ''
                 OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.lastName)  LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Employee> search(@Param("companyId") UUID companyId,
                          @Param("status") String status,
                          @Param("search") String search,
                          Pageable pageable);
}
