package com.hrapp.leavebalance;

import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leavebalance.dto.AdjustBalanceRequest;
import com.hrapp.leavebalance.dto.LeaveBalanceResponse;
import com.hrapp.leavetype.AccrualMethod;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveBalanceService {

    private final LeaveBalanceRepository balanceRepository;
    private final LeaveBalanceHistoryRepository historyRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getMyBalances() {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        Employee employee = employeeRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("No employee profile found"));
        return getBalancesForEmployee(employee.getId(), companyId);
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getBalancesForEmployee(UUID employeeId, UUID companyId) {
        int year = LocalDate.now().getYear();
        List<LeaveBalance> balances = balanceRepository.findByEmployeeIdAndYearOrderByLeaveTypeId(employeeId, year);
        Map<UUID, String> typeNames = leaveTypeRepository.findByCompanyIdAndActiveOrderByNameAsc(companyId, true)
                .stream().collect(Collectors.toMap(LeaveType::getId, LeaveType::getName));
        return balances.stream()
                .map(b -> LeaveBalanceResponse.from(b, typeNames.getOrDefault(b.getLeaveTypeId(), "Unknown")))
                .toList();
    }

    @Transactional
    public LeaveBalanceResponse adjust(UUID balanceId, AdjustBalanceRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        UUID userId = UserContext.getCurrentUser();
        LeaveBalance balance = balanceRepository.findByIdAndCompanyId(balanceId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        balance.setAdjustedDays(balance.getAdjustedDays().add(request.daysDelta()));
        balance.setUpdatedAt(Instant.now());
        balanceRepository.save(balance);

        recordHistory(balance.getId(), "ADJUSTMENT", request.daysDelta(), request.reason(), userId);

        String typeName = leaveTypeRepository.findById(balance.getLeaveTypeId())
                .map(LeaveType::getName).orElse("Unknown");
        return LeaveBalanceResponse.from(balance, typeName);
    }

    @Transactional
    public void deductBalance(UUID employeeId, UUID leaveTypeId, UUID companyId, BigDecimal days) {
        int year = LocalDate.now().getYear();
        LeaveBalance balance = getOrCreateBalance(employeeId, leaveTypeId, companyId, year);
        balance.setUsedDays(balance.getUsedDays().add(days));
        balance.setUpdatedAt(Instant.now());
        balanceRepository.save(balance);
        recordHistory(balance.getId(), "DEDUCTION", days.negate(), "Leave approved", null);
    }

    @Transactional
    public void refundBalance(UUID employeeId, UUID leaveTypeId, UUID companyId, BigDecimal days) {
        int year = LocalDate.now().getYear();
        Optional<LeaveBalance> opt = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);
        opt.ifPresent(b -> {
            b.setUsedDays(b.getUsedDays().subtract(days).max(BigDecimal.ZERO));
            b.setUpdatedAt(Instant.now());
            balanceRepository.save(b);
            recordHistory(b.getId(), "REFUND", days, "Leave rejected/cancelled", null);
        });
    }

    public LeaveBalance getOrCreateBalance(UUID employeeId, UUID leaveTypeId, UUID companyId, int year) {
        return balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year)
                .orElseGet(() -> createBalance(employeeId, leaveTypeId, companyId, year));
    }

    @Transactional
    public void initializeForEmployee(UUID employeeId, UUID companyId) {
        int year = LocalDate.now().getYear();
        List<LeaveType> activeTypes = leaveTypeRepository.findByCompanyIdAndActiveOrderByNameAsc(companyId, true);
        for (LeaveType lt : activeTypes) {
            if (balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, lt.getId(), year).isEmpty()) {
                createBalance(employeeId, lt.getId(), companyId, year);
            }
        }
    }

    private LeaveBalance createBalance(UUID employeeId, UUID leaveTypeId, UUID companyId, int year) {
        LeaveType lt = leaveTypeRepository.findById(leaveTypeId).orElse(null);
        BigDecimal entitled = lt != null && lt.getAccrualMethod() == AccrualMethod.IMMEDIATE
                ? lt.getDaysPerYear()
                : BigDecimal.ZERO;

        LeaveBalance balance = new LeaveBalance();
        balance.setCompanyId(companyId);
        balance.setEmployeeId(employeeId);
        balance.setLeaveTypeId(leaveTypeId);
        balance.setYear(year);
        balance.setEntitledDays(entitled);
        LeaveBalance saved = balanceRepository.save(balance);

        if (entitled.compareTo(BigDecimal.ZERO) > 0) {
            recordHistory(saved.getId(), "ACCRUAL", entitled, "Initial annual entitlement", null);
        }
        return saved;
    }

    // Runs on the 1st of every month at 01:00
    @Scheduled(cron = "0 0 1 1 * *")
    @Transactional
    public void runMonthlyAccrual() {
        log.info("Running monthly leave accrual job");
        try {
            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();

            List<LeaveBalance> allBalances = balanceRepository.findAll().stream()
                    .filter(b -> b.getYear() == year)
                    .toList();

            Map<UUID, LeaveType> typeMap = leaveTypeRepository.findAll().stream()
                    .collect(Collectors.toMap(LeaveType::getId, lt -> lt));

            for (LeaveBalance balance : allBalances) {
                LeaveType lt = typeMap.get(balance.getLeaveTypeId());
                if (lt == null || lt.getAccrualMethod() != AccrualMethod.MONTHLY) continue;

                BigDecimal monthlyAccrual = lt.getDaysPerYear()
                        .divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
                balance.setEntitledDays(balance.getEntitledDays().add(monthlyAccrual));
                balance.setUpdatedAt(Instant.now());
                balanceRepository.save(balance);
                recordHistory(balance.getId(), "ACCRUAL", monthlyAccrual,
                        "Monthly accrual - month " + month, null);
            }
            log.info("Monthly accrual complete for {} balances", allBalances.size());
        } catch (Exception e) {
            log.error("Monthly accrual job failed", e);
        }
    }

    private void recordHistory(UUID balanceId, String changeType, BigDecimal delta, String reason, UUID performedBy) {
        LeaveBalanceHistory h = new LeaveBalanceHistory();
        h.setBalanceId(balanceId);
        h.setChangeType(changeType);
        h.setDaysDelta(delta);
        h.setReason(reason);
        h.setPerformedBy(performedBy);
        historyRepository.save(h);
    }
}
