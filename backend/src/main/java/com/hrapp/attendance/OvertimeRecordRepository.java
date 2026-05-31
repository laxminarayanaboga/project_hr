package com.hrapp.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OvertimeRecordRepository extends JpaRepository<OvertimeRecord, UUID> {

    Optional<OvertimeRecord> findByIdAndCompanyId(UUID id, UUID companyId);

    @Query("""
            SELECT o FROM OvertimeRecord o
            JOIN com.hrapp.employee.Employee e ON e.id = o.employeeId
            WHERE o.companyId = :companyId
            AND (:teamId IS NULL OR e.managerId = :teamId)
            ORDER BY o.workDate DESC
            """)
    List<OvertimeRecord> findByTeam(@Param("companyId") UUID companyId,
                                     @Param("teamId") UUID teamId);

    @Query("""
            SELECT o FROM OvertimeRecord o
            WHERE o.employeeId = :employeeId
            AND o.companyId = :companyId
            ORDER BY o.workDate DESC
            """)
    List<OvertimeRecord> findByEmployee(@Param("employeeId") UUID employeeId,
                                         @Param("companyId") UUID companyId);
}
