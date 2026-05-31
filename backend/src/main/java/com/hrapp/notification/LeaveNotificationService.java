package com.hrapp.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LeaveNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LeaveNotificationService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@hrapp.dev}")
    private String fromAddress;

    @Async
    public void sendLeaveSubmitted(LeaveSubmittedEvent event) {
        Context ctx = new Context(Locale.UK);
        ctx.setVariable("employeeName", event.employeeName());
        ctx.setVariable("leaveType", event.leaveType());
        ctx.setVariable("startDate", event.startDate());
        ctx.setVariable("endDate", event.endDate());
        ctx.setVariable("workingDays", event.workingDays());
        ctx.setVariable("reason", event.reason());
        ctx.setVariable("managerName", event.managerName());
        send(event.managerEmail(), "Leave request from " + event.employeeName(), "email/leave-submitted", ctx);
    }

    @Async
    public void sendLeaveApproved(LeaveStatusEvent event) {
        Context ctx = new Context(Locale.UK);
        ctx.setVariable("employeeName", event.employeeName());
        ctx.setVariable("leaveType", event.leaveType());
        ctx.setVariable("startDate", event.startDate());
        ctx.setVariable("endDate", event.endDate());
        ctx.setVariable("workingDays", event.workingDays());
        send(event.employeeEmail(), "Your leave has been approved", "email/leave-approved", ctx);
    }

    @Async
    public void sendLeaveRejected(LeaveStatusEvent event) {
        Context ctx = new Context(Locale.UK);
        ctx.setVariable("employeeName", event.employeeName());
        ctx.setVariable("leaveType", event.leaveType());
        ctx.setVariable("startDate", event.startDate());
        ctx.setVariable("endDate", event.endDate());
        ctx.setVariable("reason", event.rejectionReason());
        send(event.employeeEmail(), "Your leave request was not approved", "email/leave-rejected", ctx);
    }

    @Async
    public void sendWeeklyDigest(String managerEmail, String managerName, List<PendingLeaveItem> pendingItems) {
        if (pendingItems.isEmpty()) return;
        Context ctx = new Context(Locale.UK);
        ctx.setVariable("managerName", managerName);
        ctx.setVariable("pendingItems", pendingItems);
        ctx.setVariable("count", pendingItems.size());
        send(managerEmail, "Weekly leave approval digest — " + pendingItems.size() + " pending request(s)", "email/leave-digest", ctx);
    }

    private void send(String to, String subject, String template, Context ctx) {
        try {
            String html = templateEngine.process(template, ctx);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.debug("Email sent to {} — subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {} — subject: {}", to, subject, e);
        }
    }

    public record LeaveSubmittedEvent(
            String managerEmail,
            String managerName,
            String employeeName,
            String leaveType,
            LocalDate startDate,
            LocalDate endDate,
            java.math.BigDecimal workingDays,
            String reason
    ) {}

    public record LeaveStatusEvent(
            String employeeEmail,
            String employeeName,
            String leaveType,
            LocalDate startDate,
            LocalDate endDate,
            java.math.BigDecimal workingDays,
            String rejectionReason
    ) {}

    public record PendingLeaveItem(
            String employeeName,
            String leaveType,
            LocalDate startDate,
            LocalDate endDate,
            java.math.BigDecimal workingDays
    ) {}
}
