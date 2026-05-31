package com.hrapp.leavetype;

import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.exception.ResourceNotFoundException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.leavetype.dto.CreateLeaveTypeRequest;
import com.hrapp.leavetype.dto.LeaveTypeResponse;
import com.hrapp.leavetype.dto.UpdateLeaveTypeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    @Transactional(readOnly = true)
    public List<LeaveTypeResponse> list() {
        return leaveTypeRepository.findByCompanyIdOrderByNameAsc(TenantContext.getCurrentCompany())
                .stream().map(LeaveTypeResponse::from).toList();
    }

    @Transactional
    public LeaveTypeResponse create(CreateLeaveTypeRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        if (leaveTypeRepository.existsByCompanyIdAndNameIgnoreCase(companyId, request.name())) {
            throw new BusinessException("DUPLICATE_LEAVE_TYPE", "A leave type with this name already exists");
        }
        LeaveType lt = new LeaveType();
        lt.setCompanyId(companyId);
        lt.setName(request.name());
        lt.setDaysPerYear(request.daysPerYear());
        lt.setAccrualMethod(request.accrualMethod());
        lt.setPaid(request.paid());
        lt.setRequiresApproval(request.requiresApproval());
        return LeaveTypeResponse.from(leaveTypeRepository.save(lt));
    }

    @Transactional
    public LeaveTypeResponse update(UUID id, UpdateLeaveTypeRequest request) {
        UUID companyId = TenantContext.getCurrentCompany();
        LeaveType lt = findOwned(id, companyId);
        if (request.name() != null && !request.name().equalsIgnoreCase(lt.getName())
                && leaveTypeRepository.existsByCompanyIdAndNameIgnoreCase(companyId, request.name())) {
            throw new BusinessException("DUPLICATE_LEAVE_TYPE", "A leave type with this name already exists");
        }
        if (request.name() != null)            lt.setName(request.name());
        if (request.daysPerYear() != null)     lt.setDaysPerYear(request.daysPerYear());
        if (request.accrualMethod() != null)   lt.setAccrualMethod(request.accrualMethod());
        if (request.paid() != null)            lt.setPaid(request.paid());
        if (request.requiresApproval() != null) lt.setRequiresApproval(request.requiresApproval());
        if (request.active() != null)          lt.setActive(request.active());
        lt.setUpdatedAt(Instant.now());
        return LeaveTypeResponse.from(leaveTypeRepository.save(lt));
    }

    @Transactional
    public void deactivate(UUID id) {
        UUID companyId = TenantContext.getCurrentCompany();
        LeaveType lt = findOwned(id, companyId);
        lt.setActive(false);
        lt.setUpdatedAt(Instant.now());
        leaveTypeRepository.save(lt);
    }

    @Transactional
    public void seedDefaultsForCompany(UUID companyId) {
        record Seed(String name, BigDecimal days, AccrualMethod method, boolean paid, boolean approval) {}
        List<Seed> defaults = List.of(
                new Seed("Annual Leave",    BigDecimal.valueOf(28), AccrualMethod.IMMEDIATE, true,  true),
                new Seed("Sick Leave",      BigDecimal.valueOf(10), AccrualMethod.NONE,      true,  false),
                new Seed("Unpaid Leave",    BigDecimal.ZERO,        AccrualMethod.NONE,      false, true),
                new Seed("Maternity Leave", BigDecimal.valueOf(52), AccrualMethod.NONE,      true,  true),
                new Seed("Paternity Leave", BigDecimal.valueOf(2),  AccrualMethod.NONE,      true,  true)
        );
        for (Seed s : defaults) {
            LeaveType lt = new LeaveType();
            lt.setCompanyId(companyId);
            lt.setName(s.name());
            lt.setDaysPerYear(s.days());
            lt.setAccrualMethod(s.method());
            lt.setPaid(s.paid());
            lt.setRequiresApproval(s.approval());
            leaveTypeRepository.save(lt);
        }
    }

    public List<LeaveType> findActiveByCompanyId(UUID companyId) {
        return leaveTypeRepository.findByCompanyIdAndActiveOrderByNameAsc(companyId, true);
    }

    public LeaveType findByIdAndCompanyId(UUID id, UUID companyId) {
        return findOwned(id, companyId);
    }

    private LeaveType findOwned(UUID id, UUID companyId) {
        return leaveTypeRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found"));
    }
}
