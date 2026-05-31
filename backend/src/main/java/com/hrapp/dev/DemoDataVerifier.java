package com.hrapp.dev;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DemoDataVerifier {

    private static final Logger log = LoggerFactory.getLogger(DemoDataVerifier.class);

    @EventListener(ApplicationReadyEvent.class)
    public void printBanner() {
        log.info("""

                ╔══════════════════════════════════════════════════════════════════╗
                ║            DEMO SEED DATA LOADED — DEV PROFILE                  ║
                ╠══════════════════════════════════════════════════════════════════╣
                ║  Pinnacle Digital Ltd     admin@pinnacle-digital.co.uk          ║
                ║  Blossom Care Services    admin@blossomcare.co.uk               ║
                ║  Thornwood Consulting     admin@thornwood-consulting.co.uk       ║
                ║  Password (all accounts): Demo1234!                             ║
                ║  Mailpit web UI:          http://localhost:8025                  ║
                ╚══════════════════════════════════════════════════════════════════╝
                """);
    }
}
