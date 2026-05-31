package com.hrapp.leaverequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findByEmployeeIdAndCompanyIdOrderByCreatedAtDesc(UUID employeeId, UUID companyId);

    Optional<LeaveRequest> findByIdAndCompanyId(UUID id, UUID companyId);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.companyId = :companyId
            AND lr.employeeId IN :employeeIds
            AND lr.status = 'PENDING'
            ORDER BY lr.createdAt ASC
            """)
    List<LeaveRequest> findPendingByEmployeeIds(
            @Param("companyId") UUID companyId,
            @Param("employeeIds") List<UUID> employeeIds);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.companyId = :companyId
            AND lr.employeeId IN :employeeIds
            AND lr.status = 'APPROVED'
            AND lr.endDate >= :from
            AND lr.startDate <= :to
            ORDER BY lr.startDate ASC
            """)
    List<LeaveRequest> findApprovedTeamLeave(
            @Param("companyId") UUID companyId,
            @Param("employeeIds") List<UUID> employeeIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
