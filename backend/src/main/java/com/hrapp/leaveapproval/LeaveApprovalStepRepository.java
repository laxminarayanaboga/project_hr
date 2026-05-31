package com.hrapp.leaveapproval;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveApprovalStepRepository extends JpaRepository<LeaveApprovalStep, UUID> {

    List<LeaveApprovalStep> findByLeaveTypeIdOrderByStepOrderAsc(UUID leaveTypeId);

    void deleteByLeaveTypeId(UUID leaveTypeId);
}
