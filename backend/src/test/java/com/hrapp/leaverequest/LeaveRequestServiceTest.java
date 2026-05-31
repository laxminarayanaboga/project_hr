package com.hrapp.leaverequest;

import com.hrapp.auth.EmailService;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.common.multitenancy.UserContext;
import com.hrapp.employee.Employee;
import com.hrapp.employee.EmployeeRepository;
import com.hrapp.leaveapproval.LeaveApprovalService;
import com.hrapp.leavebalance.LeaveBalance;
import com.hrapp.leavebalance.LeaveBalanceService;
import com.hrapp.leaverequest.dto.CreateLeaveRequestRequest;
import com.hrapp.leaverequest.dto.LeaveRequestResponse;
import com.hrapp.leavetype.LeaveType;
import com.hrapp.leavetype.AccrualMethod;
import com.hrapp.leavetype.LeaveTypeService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LeaveRequestServiceTest {

    @Mock LeaveRequestRepository leaveRequestRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock LeaveTypeService leaveTypeService;
    @Mock LeaveBalanceService leaveBalanceService;
    @Mock LeaveApprovalService leaveApprovalService;
    @Mock BusinessDayCalculator businessDayCalculator;
    @Mock EmailService emailService;

    @InjectMocks LeaveRequestService service;

    private final UUID COMPANY_ID  = UUID.randomUUID();
    private final UUID USER_ID     = UUID.randomUUID();
    private final UUID EMPLOYEE_ID = UUID.randomUUID();
    private final UUID LT_ID       = UUID.randomUUID();
    private final UUID LR_ID       = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setCurrentCompany(COMPANY_ID);
        UserContext.setCurrentUser(USER_ID);
        mockSecurityContext("EMPLOYEE");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        UserContext.clear();
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(String role) {
        Authentication auth = mock(Authentication.class);
        when(auth.getAuthorities()).thenAnswer(inv ->
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    private Employee stubEmployee() {
        Employee e = new Employee();
        e.setId(EMPLOYEE_ID);
        e.setCompanyId(COMPANY_ID);
        e.setUserId(USER_ID);
        e.setFirstName("Jane");
        e.setLastName("Smith");
        return e;
    }

    private LeaveType stubLeaveType(boolean requiresApproval) {
        LeaveType lt = new LeaveType();
        lt.setId(LT_ID);
        lt.setCompanyId(COMPANY_ID);
        lt.setName("Annual Leave");
        lt.setDaysPerYear(BigDecimal.valueOf(28));
        lt.setAccrualMethod(AccrualMethod.IMMEDIATE);
        lt.setActive(true);
        lt.setRequiresApproval(requiresApproval);
        return lt;
    }

    private LeaveBalance stubBalance(BigDecimal remaining) {
        LeaveBalance b = new LeaveBalance();
        b.setId(UUID.randomUUID());
        b.setEmployeeId(EMPLOYEE_ID);
        b.setLeaveTypeId(LT_ID);
        b.setEntitledDays(remaining);
        b.setUsedDays(BigDecimal.ZERO);
        b.setAdjustedDays(BigDecimal.ZERO);
        return b;
    }

    private LeaveRequest stubRequest(LeaveStatus status) {
        LeaveRequest lr = new LeaveRequest();
        lr.setId(LR_ID);
        lr.setCompanyId(COMPANY_ID);
        lr.setEmployeeId(EMPLOYEE_ID);
        lr.setLeaveTypeId(LT_ID);
        lr.setStartDate(LocalDate.now().plusDays(1));
        lr.setEndDate(LocalDate.now().plusDays(3));
        lr.setWorkingDays(BigDecimal.valueOf(3));
        lr.setStatus(status);
        return lr;
    }

    @Test
    void submit_createsLeaveRequest_andCreatesApprovalSteps() {
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(stubEmployee()));
        when(leaveTypeService.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(stubLeaveType(true));
        when(businessDayCalculator.calculate(eq(COMPANY_ID), any(), any())).thenReturn(BigDecimal.valueOf(3));
        when(leaveBalanceService.getOrCreateBalance(any(), any(), any(), anyInt())).thenReturn(stubBalance(BigDecimal.valueOf(28)));
        when(leaveRequestRepository.save(any())).thenAnswer(inv -> {
            LeaveRequest lr = inv.getArgument(0);
            lr.setId(LR_ID);
            return lr;
        });

        CreateLeaveRequestRequest req = new CreateLeaveRequestRequest(
                LT_ID, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), "Holiday");
        LeaveRequestResponse result = service.submit(req);

        assertThat(result.status()).isEqualTo(LeaveStatus.PENDING);
        verify(leaveApprovalService).createApprovalStepsForRequest(any());
    }

    @Test
    void submit_autoApprovesWhenNoApprovalRequired() {
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(stubEmployee()));
        when(leaveTypeService.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(stubLeaveType(false));
        when(businessDayCalculator.calculate(eq(COMPANY_ID), any(), any())).thenReturn(BigDecimal.valueOf(2));
        when(leaveBalanceService.getOrCreateBalance(any(), any(), any(), anyInt())).thenReturn(stubBalance(BigDecimal.valueOf(10)));
        when(leaveRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LeaveRequestResponse result = service.submit(new CreateLeaveRequestRequest(
                LT_ID, LocalDate.now().plusDays(1), LocalDate.now().plusDays(2), null));

        assertThat(result.status()).isEqualTo(LeaveStatus.APPROVED);
        verify(leaveBalanceService).deductBalance(any(), any(), any(), any());
        verify(leaveApprovalService, never()).createApprovalStepsForRequest(any());
    }

    @Test
    void submit_throwsWhenStartDateInPast() {
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(stubEmployee()));
        when(leaveTypeService.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(stubLeaveType(true));

        assertThatThrownBy(() -> service.submit(new CreateLeaveRequestRequest(
                LT_ID, LocalDate.now().minusDays(1), LocalDate.now(), null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("past");
    }

    @Test
    void submit_throwsWhenInsufficientBalance() {
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(stubEmployee()));
        when(leaveTypeService.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(stubLeaveType(true));
        when(businessDayCalculator.calculate(eq(COMPANY_ID), any(), any())).thenReturn(BigDecimal.valueOf(5));
        when(leaveBalanceService.getOrCreateBalance(any(), any(), any(), anyInt())).thenReturn(stubBalance(BigDecimal.valueOf(2)));

        assertThatThrownBy(() -> service.submit(new CreateLeaveRequestRequest(
                LT_ID, LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("balance");
    }

    @Test
    void cancel_setsCancelledStatus() {
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(stubEmployee()));
        when(leaveRequestRepository.findByIdAndCompanyId(LR_ID, COMPANY_ID))
                .thenReturn(Optional.of(stubRequest(LeaveStatus.PENDING)));
        when(leaveRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.cancel(LR_ID);
        verify(leaveRequestRepository).save(argThat(lr -> lr.getStatus() == LeaveStatus.CANCELLED));
    }

    @Test
    void cancel_throwsWhenNotPending() {
        when(employeeRepository.findByUserIdAndCompanyId(USER_ID, COMPANY_ID)).thenReturn(Optional.of(stubEmployee()));
        when(leaveRequestRepository.findByIdAndCompanyId(LR_ID, COMPANY_ID))
                .thenReturn(Optional.of(stubRequest(LeaveStatus.APPROVED)));

        assertThatThrownBy(() -> service.cancel(LR_ID)).isInstanceOf(BusinessException.class);
    }
}
