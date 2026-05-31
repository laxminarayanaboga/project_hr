package com.hrapp.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LeaveNotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    private LeaveNotificationService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new LeaveNotificationService(mailSender, templateEngine);
        var fromField = LeaveNotificationService.class.getDeclaredField("fromAddress");
        fromField.setAccessible(true);
        fromField.set(service, "noreply@hrapp.dev");

        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>test</html>");
    }

    @Test
    void sendLeaveSubmitted_sendsEmailToManager() throws MessagingException {
        var event = new LeaveNotificationService.LeaveSubmittedEvent(
                "manager@company.com", "Alice Manager",
                "Bob Employee", "Annual Leave",
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 5),
                BigDecimal.valueOf(5), "Holiday"
        );

        service.sendLeaveSubmitted(event);

        verify(templateEngine).process(eq("email/leave-submitted"), any(Context.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendLeaveApproved_sendsEmailToEmployee() {
        var event = new LeaveNotificationService.LeaveStatusEvent(
                "employee@company.com", "Bob Employee", "Annual Leave",
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 5),
                BigDecimal.valueOf(5), null
        );

        service.sendLeaveApproved(event);

        verify(templateEngine).process(eq("email/leave-approved"), any(Context.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendLeaveRejected_sendsEmailToEmployee() {
        var event = new LeaveNotificationService.LeaveStatusEvent(
                "employee@company.com", "Bob Employee", "Annual Leave",
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 5),
                BigDecimal.valueOf(5), "Team too small"
        );

        service.sendLeaveRejected(event);

        verify(templateEngine).process(eq("email/leave-rejected"), any(Context.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWeeklyDigest_skipsWhenNoPendingItems() {
        service.sendWeeklyDigest("manager@company.com", "Alice Manager", List.of());

        verifyNoInteractions(mailSender);
        verifyNoInteractions(templateEngine);
    }

    @Test
    void sendWeeklyDigest_sendsEmailWhenItemsPresent() {
        var items = List.of(new LeaveNotificationService.PendingLeaveItem(
                "Bob Employee", "Annual Leave",
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 3), BigDecimal.valueOf(3)
        ));

        service.sendWeeklyDigest("manager@company.com", "Alice Manager", items);

        verify(templateEngine).process(eq("email/leave-digest"), any(Context.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendLeaveSubmitted_setsCorrectTemplateVariables() {
        ArgumentCaptor<Context> ctxCaptor = ArgumentCaptor.forClass(Context.class);
        var event = new LeaveNotificationService.LeaveSubmittedEvent(
                "manager@company.com", "Alice Manager",
                "Bob Employee", "Sick Leave",
                LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 11),
                BigDecimal.ONE, "Unwell"
        );

        service.sendLeaveSubmitted(event);

        verify(templateEngine).process(anyString(), ctxCaptor.capture());
        Context ctx = ctxCaptor.getValue();
        assertThat(ctx.getVariable("employeeName")).isEqualTo("Bob Employee");
        assertThat(ctx.getVariable("leaveType")).isEqualTo("Sick Leave");
        assertThat(ctx.getVariable("managerName")).isEqualTo("Alice Manager");
        assertThat(ctx.getVariable("reason")).isEqualTo("Unwell");
    }
}
