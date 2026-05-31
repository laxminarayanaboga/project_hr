package com.hrapp.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendWelcomeEmail(String email, String companyName) {
        // SES deferred until staging deploy — log locally for now
        log.info("Welcome email queued for {} (company: {})", email, companyName);
    }

    public void sendPasswordResetEmail(String email, String resetToken) {
        // SES deferred until staging deploy — log reset link locally
        log.info("Password reset email queued for {} — token: {}", email, resetToken);
    }

    public void sendLeaveSubmittedEmail(String employeeEmail, String managerEmail, String leaveType, String dates) {
        log.info("Leave submitted email queued — employee: {}, manager: {}, type: {}, dates: {}",
                employeeEmail, managerEmail, leaveType, dates);
    }

    public void sendLeaveApprovedEmail(String employeeEmail, String leaveType, String dates) {
        log.info("Leave approved email queued for {} — type: {}, dates: {}", employeeEmail, leaveType, dates);
    }

    public void sendLeaveRejectedEmail(String employeeEmail, String leaveType, String reason) {
        log.info("Leave rejected email queued for {} — type: {}, reason: {}", employeeEmail, leaveType, reason);
    }

    public void notifyNextApprover(java.util.UUID leaveRequestId, int nextStep) {
        log.info("Next approver notification queued — request: {}, step: {}", leaveRequestId, nextStep);
    }
}
