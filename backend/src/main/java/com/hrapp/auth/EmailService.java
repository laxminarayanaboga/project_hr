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
}
