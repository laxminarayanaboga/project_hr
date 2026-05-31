package com.hrapp.leavetype;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.leavetype.dto.CreateLeaveTypeRequest;
import com.hrapp.leavetype.dto.LeaveTypeResponse;
import com.hrapp.leavetype.dto.UpdateLeaveTypeRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveTypeServiceTest {

    @Mock LeaveTypeRepository leaveTypeRepository;
    @InjectMocks LeaveTypeService service;

    private final UUID COMPANY_ID = UUID.randomUUID();
    private final UUID LT_ID = UUID.randomUUID();

    @BeforeEach void setUp() { TenantContext.setCurrentCompany(COMPANY_ID); }
    @AfterEach  void tearDown() { TenantContext.clear(); }

    private LeaveType stubLeaveType() {
        LeaveType lt = new LeaveType();
        lt.setId(LT_ID);
        lt.setCompanyId(COMPANY_ID);
        lt.setName("Annual Leave");
        lt.setDaysPerYear(BigDecimal.valueOf(28));
        lt.setAccrualMethod(AccrualMethod.IMMEDIATE);
        lt.setPaid(true);
        lt.setRequiresApproval(true);
        lt.setActive(true);
        return lt;
    }

    @Test
    void list_returnsLeaveTypesForCompany() {
        when(leaveTypeRepository.findByCompanyIdOrderByNameAsc(COMPANY_ID)).thenReturn(List.of(stubLeaveType()));
        List<LeaveTypeResponse> result = service.list();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Annual Leave");
    }

    @Test
    void create_savesAndReturnsLeaveType() {
        when(leaveTypeRepository.existsByCompanyIdAndNameIgnoreCase(COMPANY_ID, "Summer Leave")).thenReturn(false);
        LeaveType saved = stubLeaveType();
        saved.setName("Summer Leave");
        when(leaveTypeRepository.save(any())).thenReturn(saved);

        LeaveTypeResponse result = service.create(new CreateLeaveTypeRequest(
                "Summer Leave", BigDecimal.valueOf(5), AccrualMethod.NONE, true, true));
        assertThat(result.name()).isEqualTo("Summer Leave");
    }

    @Test
    void create_throwsOnDuplicateName() {
        when(leaveTypeRepository.existsByCompanyIdAndNameIgnoreCase(COMPANY_ID, "Annual Leave")).thenReturn(true);
        assertThatThrownBy(() -> service.create(
                new CreateLeaveTypeRequest("Annual Leave", BigDecimal.TEN, AccrualMethod.NONE, true, true)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void update_patchesFieldsSelectively() {
        when(leaveTypeRepository.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(Optional.of(stubLeaveType()));
        when(leaveTypeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LeaveTypeResponse result = service.update(LT_ID,
                new UpdateLeaveTypeRequest(null, BigDecimal.valueOf(30), null, null, null, null));
        assertThat(result.daysPerYear()).isEqualByComparingTo(BigDecimal.valueOf(30));
        assertThat(result.name()).isEqualTo("Annual Leave"); // unchanged
    }

    @Test
    void deactivate_setsActiveFalse() {
        LeaveType lt = stubLeaveType();
        when(leaveTypeRepository.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(Optional.of(lt));
        when(leaveTypeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.deactivate(LT_ID);
        assertThat(lt.isActive()).isFalse();
    }

    @Test
    void update_throwsNotFound_whenLeaveTypeNotOwned() {
        when(leaveTypeRepository.findByIdAndCompanyId(LT_ID, COMPANY_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.update(LT_ID, new UpdateLeaveTypeRequest(null, null, null, null, null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void seedDefaultsForCompany_savesExpectedTypes() {
        service.seedDefaultsForCompany(COMPANY_ID);
        verify(leaveTypeRepository, times(5)).save(any(LeaveType.class));
    }
}
