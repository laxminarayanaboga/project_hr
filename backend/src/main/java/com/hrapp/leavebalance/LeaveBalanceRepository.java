package com.hrapp.leavebalance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    List<LeaveBalance> findByEmployeeIdAndYearOrderByLeaveTypeId(UUID employeeId, int year);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(UUID employeeId, UUID leaveTypeId, int year);

    Optional<LeaveBalance> findByIdAndCompanyId(UUID id, UUID companyId);

    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.companyId = :companyId AND lb.year = :year")
    List<LeaveBalance> findByCompanyIdAndYear(@Param("companyId") UUID companyId, @Param("year") int year);
}
