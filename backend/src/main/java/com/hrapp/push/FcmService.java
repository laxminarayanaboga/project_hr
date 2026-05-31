package com.hrapp.push;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Sends FCM push notifications.
 * Local dev logs instead of calling FCM (fcm.enabled=false).
 * Wire FCM service account credentials and set fcm.enabled=true in staging/prod.
 */
@Service
@RequiredArgsConstructor
public class FcmService {

    private static final Logger log = LoggerFactory.getLogger(FcmService.class);

    @Value("${fcm.enabled:false}")
    private boolean enabled;

    @Async
    public void sendToUser(List<String> fcmTokens, String title, String body) {
        if (fcmTokens == null || fcmTokens.isEmpty()) {
            return;
        }
        if (!enabled) {
            log.info("[FCM-LOCAL] Push → {} token(s) | {} | {}", fcmTokens.size(), title, body);
            return;
        }
        // FCM HTTP v1 sending goes here — inject FirebaseMessaging bean when wiring up staging
        log.warn("FCM enabled but FirebaseMessaging not yet wired — skipping push to {} token(s)", fcmTokens.size());
    }
}
