package com.hrapp.push;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class FcmServiceTest {

    @InjectMocks
    private FcmService fcmService;

    @Test
    void sendToUser_doesNotThrow_whenDisabled() {
        ReflectionTestUtils.setField(fcmService, "enabled", false);
        fcmService.sendToUser(List.of("token1", "token2"), "Test Title", "Test Body");
    }

    @Test
    void sendToUser_doesNotThrow_whenTokenListEmpty() {
        ReflectionTestUtils.setField(fcmService, "enabled", false);
        fcmService.sendToUser(List.of(), "Title", "Body");
    }

    @Test
    void sendToUser_doesNotThrow_whenTokenListNull() {
        ReflectionTestUtils.setField(fcmService, "enabled", false);
        fcmService.sendToUser(null, "Title", "Body");
    }
}
