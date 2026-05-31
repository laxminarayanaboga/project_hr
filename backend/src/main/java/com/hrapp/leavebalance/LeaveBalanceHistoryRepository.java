package com.hrapp.leavebalance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveBalanceHistoryRepository extends JpaRepository<LeaveBalanceHistory, UUID> {
    List<LeaveBalanceHistory> findByBalanceIdOrderByCreatedAtDesc(UUID balanceId);
}
