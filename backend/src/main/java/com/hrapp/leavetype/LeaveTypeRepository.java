package com.hrapp.leavetype;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID> {

    List<LeaveType> findByCompanyIdOrderByNameAsc(UUID companyId);

    List<LeaveType> findByCompanyIdAndActiveOrderByNameAsc(UUID companyId, boolean active);

    Optional<LeaveType> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndNameIgnoreCase(UUID companyId, String name);
}
