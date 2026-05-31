package com.hrapp.leaverequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;

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

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.companyId = :companyId
            AND lr.startDate >= :from
            AND lr.endDate <= :to
            AND (:employeeId IS NULL OR lr.employeeId = :employeeId)
            AND (:leaveTypeId IS NULL OR lr.leaveTypeId = :leaveTypeId)
            AND (:employeeIds IS NULL OR lr.employeeId IN :employeeIds)
            ORDER BY lr.startDate ASC
            """)
    List<LeaveRequest> findForReport(
            @Param("companyId") UUID companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("employeeId") UUID employeeId,
            @Param("leaveTypeId") UUID leaveTypeId,
            @Param("employeeIds") Collection<UUID> employeeIds);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.companyId = :companyId
            AND lr.status = 'APPROVED'
            AND lr.startDate <= :today
            AND lr.endDate >= :today
            AND lr.employeeId IN :employeeIds
            ORDER BY lr.startDate ASC
            """)
    List<LeaveRequest> findOffToday(
            @Param("companyId") UUID companyId,
            @Param("today") LocalDate today,
            @Param("employeeIds") Collection<UUID> employeeIds);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.companyId = :companyId
            AND lr.status = 'APPROVED'
            AND lr.startDate > :today
            AND lr.startDate <= :horizon
            AND lr.employeeId IN :employeeIds
            ORDER BY lr.startDate ASC
            """)
    List<LeaveRequest> findUpcoming(
            @Param("companyId") UUID companyId,
            @Param("today") LocalDate today,
            @Param("horizon") LocalDate horizon,
            @Param("employeeIds") Collection<UUID> employeeIds);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.companyId = :companyId
            AND lr.status = 'APPROVED'
            AND lr.startDate >= :from
            AND lr.endDate <= :to
            AND lr.employeeId IN :employeeIds
            """)
    List<LeaveRequest> findApprovedInPeriod(
            @Param("companyId") UUID companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("employeeIds") Collection<UUID> employeeIds);
}
