package com.hrapp.leavebalance;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leavebalance.dto.AdjustBalanceRequest;
import com.hrapp.leavebalance.dto.LeaveBalanceResponse;
import com.hrapp.leavetype.AccrualMethod;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.LeaveTypeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveBalanceServiceTest {

    @Mock LeaveBalanceRepository balanceRepository;
    @Mock LeaveBalanceHistoryRepository historyRepository;
    @Mock LeaveTypeRepository leaveTypeRepository;
    @Mock EmployeeRepository employeeRepository;

    @InjectMocks LeaveBalanceService service;

    private final UUID COMPANY_ID  = UUID.randomUUID();
    private final UUID USER_ID     = UUID.randomUUID();
    private final UUID EMPLOYEE_ID = UUID.randomUUID();
    private final UUID LT_ID       = UUID.randomUUID();
    private final UUID BALANCE_ID  = UUID.randomUUID();

    @BeforeEach void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        UserContext.setCurrentUser(USER_ID);
    }
    @AfterEach void tearDown() {
        TenantContext.clear();
        UserContext.clear();
    }

    private LeaveBalance stubBalance(BigDecimal entitled) {
        LeaveBalance b = new LeaveBalance();
        b.setId(BALANCE_ID);
        b.setCompanyId(COMPANY_ID);
        b.setEmployeeId(EMPLOYEE_ID);
        b.setLeaveTypeId(LT_ID);
        b.setYear(LocalDate.now().getYear());
        b.setEntitledDays(entitled);
        b.setUsedDays(BigDecimal.ZERO);
        b.setAdjustedDays(BigDecimal.ZERO);
        return b;
    }

    private LeaveType stubLeaveType(AccrualMethod method) {
        LeaveType lt = new LeaveType();
        lt.setId(LT_ID);
        lt.setName("Annual Leave");
        lt.setDaysPerYear(BigDecimal.valueOf(28));
        lt.setAccrualMethod(method);
        lt.setActive(true);
        return lt;
    }

    @Test
    void getMyBalances_returnsBalancesForCurrentEmployee() {
        Employee e = new Employee();
        e.setId(EMPLOYEE_ID);
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(e));
        when(balanceRepository.findByEmployeeIdAndYearOrderByLeaveTypeId(eq(EMPLOYEE_ID), anyInt()))
                .thenReturn(List.of(stubBalance(BigDecimal.valueOf(28))));
        when(leaveTypeRepository.findByCompanyIdAndActiveOrderByNameAsc(COMPANY_ID, true))
                .thenReturn(List.of(stubLeaveType(AccrualMethod.IMMEDIATE)));

        List<LeaveBalanceResponse> result = service.getMyBalances();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).entitledDays()).isEqualByComparingTo(BigDecimal.valueOf(28));
    }

    @Test
    void adjust_addsToAdjustedDays() {
        LeaveBalance balance = stubBalance(BigDecimal.valueOf(28));
        when(balanceRepository.findByIdAndCompanyId(BALANCE_ID, COMPANY_ID)).thenReturn(Optional.of(balance));
        when(balanceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(leaveTypeRepository.findById(LT_ID)).thenReturn(Optional.of(stubLeaveType(AccrualMethod.IMMEDIATE)));

        LeaveBalanceResponse result = service.adjust(BALANCE_ID, new AdjustBalanceRequest(BigDecimal.valueOf(5), "Carry-over"));
        assertThat(result.adjustedDays()).isEqualByComparingTo(BigDecimal.valueOf(5));
        assertThat(result.remainingDays()).isEqualByComparingTo(BigDecimal.valueOf(33));
        verify(historyRepository).save(any());
    }

    @Test
    void deductBalance_increasesUsedDays() {
        LeaveBalance balance = stubBalance(BigDecimal.valueOf(28));
        when(balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(eq(EMPLOYEE_ID), eq(LT_ID), anyInt()))
                .thenReturn(Optional.of(balance));
        when(balanceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.deductBalance(EMPLOYEE_ID, LT_ID, COMPANY_ID, BigDecimal.valueOf(3));
        assertThat(balance.getUsedDays()).isEqualByComparingTo(BigDecimal.valueOf(3));
        verify(historyRepository).save(any());
    }

    @Test
    void getOrCreateBalance_createsNewBalanceWithImmediateEntitlement() {
        when(balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(eq(EMPLOYEE_ID), eq(LT_ID), anyInt()))
                .thenReturn(Optional.empty());
        when(leaveTypeRepository.findById(LT_ID)).thenReturn(Optional.of(stubLeaveType(AccrualMethod.IMMEDIATE)));
        when(balanceRepository.save(any())).thenAnswer(inv -> {
            LeaveBalance b = inv.getArgument(0);
            b.setId(BALANCE_ID);
            return b;
        });

        LeaveBalance result = service.getOrCreateBalance(EMPLOYEE_ID, LT_ID, COMPANY_ID, LocalDate.now().getYear());
        assertThat(result.getEntitledDays()).isEqualByComparingTo(BigDecimal.valueOf(28));
    }
}
