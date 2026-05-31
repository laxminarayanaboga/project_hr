package com.hrapp.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByIdAndCompanyId(UUID id, UUID companyId);

    Optional<Employee> findByUserIdAndCompanyId(UUID userId, UUID companyId);

    @Query("""
            SELECT e FROM Employee e
            WHERE e.companyId = :companyId
            AND e.managerId = :managerId
            AND e.employmentStatus = 'ACTIVE'
            """)
    List<Employee> findDirectReports(@Param("companyId") UUID companyId, @Param("managerId") UUID managerId);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndEmploymentStatus(UUID companyId, String status);

    long countByCompanyIdAndStartDateBetween(UUID companyId, LocalDate from, LocalDate to);

    @Query("""
            SELECT e FROM Employee e
            WHERE e.companyId = :companyId
            ORDER BY e.createdAt DESC
            """)
    List<Employee> findRecentByCompanyId(@Param("companyId") UUID companyId, Pageable pageable);

    List<Employee> findByCompanyIdAndDepartmentId(UUID companyId, UUID departmentId);

    List<Employee> findByCompanyId(UUID companyId);

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
