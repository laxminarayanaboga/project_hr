package com.hrapp.attendance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findByIdAndCompanyId(UUID id, UUID companyId);

    @Query("""
            SELECT a FROM AttendanceRecord a
            WHERE a.employeeId = :employeeId
            AND a.companyId = :companyId
            AND a.clockOut IS NULL
            """)
    Optional<AttendanceRecord> findActiveSession(@Param("employeeId") UUID employeeId,
                                                  @Param("companyId") UUID companyId);

    @Query("""
            SELECT a FROM AttendanceRecord a
            WHERE a.employeeId = :employeeId
            AND a.companyId = :companyId
            AND a.clockIn >= :from
            ORDER BY a.clockIn DESC
            """)
    List<AttendanceRecord> findTodayRecords(@Param("employeeId") UUID employeeId,
                                             @Param("companyId") UUID companyId,
                                             @Param("from") Instant from);

    @Query("""
            SELECT a FROM AttendanceRecord a
            WHERE a.employeeId = :employeeId
            AND a.companyId = :companyId
            ORDER BY a.clockIn DESC
            """)
    Page<AttendanceRecord> findHistory(@Param("employeeId") UUID employeeId,
                                        @Param("companyId") UUID companyId,
                                        Pageable pageable);
}
