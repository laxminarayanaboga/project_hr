package com.hrapp.leaveapproval;

import com.hrapp.auth.EmailService;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.leaveapproval.dto.ApprovalChainResponse;
import com.hrapp.leaveapproval.dto.ApprovalStepRequest;
import com.hrapp.leaverequest.LeaveRequest;
import com.hrapp.leaverequest.LeaveRequestRepository;
import com.hrapp.leaverequest.LeaveStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveApprovalService {

    private final LeaveApprovalStepRepository stepRepository;
    private final LeaveRequestApprovalRepository requestApprovalRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<ApprovalChainResponse> getChain(UUID leaveTypeId) {
        return stepRepository.findByLeaveTypeIdOrderByStepOrderAsc(leaveTypeId)
                .stream().map(ApprovalChainResponse::from).toList();
    }

    @Transactional
    public List<ApprovalChainResponse> setChain(UUID leaveTypeId, List<ApprovalStepRequest> steps) {
        UUID companyId = TenantContext.getCurrentCompany();
        stepRepository.deleteByLeaveTypeId(leaveTypeId);

        return steps.stream()
                .sorted((a, b) -> Integer.compare(a.stepOrder(), b.stepOrder()))
                .map(req -> {
                    LeaveApprovalStep step = new LeaveApprovalStep();
                    step.setCompanyId(companyId);
                    step.setLeaveTypeId(leaveTypeId);
                    step.setStepOrder(req.stepOrder());
                    step.setApproverType(req.approverType());
                    return ApprovalChainResponse.from(stepRepository.save(step));
                }).toList();
    }

    @Transactional
    public void createApprovalStepsForRequest(LeaveRequest request) {
        List<LeaveApprovalStep> chain = stepRepository.findByLeaveTypeIdOrderByStepOrderAsc(request.getLeaveTypeId());

        if (chain.isEmpty()) {
            // Default: single DIRECT_MANAGER step
            LeaveRequestApproval approval = new LeaveRequestApproval();
            approval.setLeaveRequestId(request.getId());
            approval.setStepOrder(1);
            approval.setApproverType(ApproverType.DIRECT_MANAGER);
            approval.setStatus(LeaveStatus.PENDING);
            requestApprovalRepository.save(approval);
        } else {
            for (LeaveApprovalStep step : chain) {
                LeaveRequestApproval approval = new LeaveRequestApproval();
                approval.setLeaveRequestId(request.getId());
                approval.setStepOrder(step.getStepOrder());
                approval.setApproverType(step.getApproverType());
                approval.setStatus(LeaveStatus.PENDING);
                requestApprovalRepository.save(approval);
            }
        }
    }

    @Transactional
    public boolean processApproval(UUID leaveRequestId, UUID approverId, String comment, boolean approved) {
        LeaveRequestApproval currentStep = requestApprovalRepository
                .findFirstByLeaveRequestIdAndStatusOrderByStepOrderAsc(leaveRequestId, LeaveStatus.PENDING)
                .orElseThrow(() -> new BusinessException("NO_PENDING_STEP", "No pending approval step found"));

        currentStep.setApproverId(approverId);
        currentStep.setComment(comment);
        currentStep.setDecidedAt(Instant.now());
        currentStep.setStatus(approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED);
        requestApprovalRepository.save(currentStep);

        if (!approved) {
            return false; // caller should reject the leave request
        }

        // Check if there are more pending steps
        boolean moreSteps = requestApprovalRepository
                .findFirstByLeaveRequestIdAndStatusOrderByStepOrderAsc(leaveRequestId, LeaveStatus.PENDING)
                .isPresent();

        if (moreSteps) {
            log.info("Leave request {} approved at step {} — waiting for next approver", leaveRequestId, currentStep.getStepOrder());
            emailService.notifyNextApprover(leaveRequestId, currentStep.getStepOrder() + 1);
            return false; // not fully approved yet
        }

        return true; // all steps approved — caller should finalize the leave request
    }

    @Transactional
    public void overrideApprove(UUID leaveRequestId, UUID adminId) {
        // Mark all pending steps as approved by the admin
        List<LeaveRequestApproval> pending = requestApprovalRepository
                .findByLeaveRequestIdOrderByStepOrderAsc(leaveRequestId).stream()
                .filter(a -> a.getStatus() == LeaveStatus.PENDING)
                .toList();
        for (LeaveRequestApproval step : pending) {
            step.setApproverId(adminId);
            step.setComment("Override approved by HR Admin");
            step.setDecidedAt(Instant.now());
            step.setStatus(LeaveStatus.APPROVED);
            requestApprovalRepository.save(step);
        }
    }

    public boolean isAuthorizedToApprove(LeaveRequest request, UUID currentUserId, String currentUserRole,
                                          UUID currentEmployeeId) {
        if ("HR_ADMIN".equals(currentUserRole)) return true;

        LeaveRequestApproval pendingStep = requestApprovalRepository
                .findFirstByLeaveRequestIdAndStatusOrderByStepOrderAsc(request.getId(), LeaveStatus.PENDING)
                .orElse(null);
        if (pendingStep == null) return false;

        if (pendingStep.getApproverType() == ApproverType.HR_ADMIN) {
            return "HR_ADMIN".equals(currentUserRole);
        }
        // DIRECT_MANAGER: check if current user's employee ID matches the requestor's manager
        return pendingStep.getApproverType() == ApproverType.DIRECT_MANAGER;
        // caller must also verify that the current user is actually the employee's direct manager
    }
}
