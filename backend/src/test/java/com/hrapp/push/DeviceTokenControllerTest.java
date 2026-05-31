package com.hrapp.push;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DeviceTokenControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private DeviceTokenService deviceTokenService;

    @InjectMocks
    private DeviceTokenController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void registerToken_returns200_onValidRequest() throws Exception {
        doNothing().when(deviceTokenService).registerToken("test-token-xyz", "android");
        var body = Map.of("fcmToken", "test-token-xyz", "platform", "android");

        mockMvc.perform(post("/api/v1/devices/register-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(deviceTokenService).registerToken("test-token-xyz", "android");
    }

    @Test
    void registerToken_returns400_whenFcmTokenBlank() throws Exception {
        var body = Map.of("fcmToken", "", "platform", "android");

        mockMvc.perform(post("/api/v1/devices/register-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerToken_returns400_whenPlatformInvalid() throws Exception {
        var body = Map.of("fcmToken", "token", "platform", "windows");

        mockMvc.perform(post("/api/v1/devices/register-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unregisterToken_returns200_onValidRequest() throws Exception {
        doNothing().when(deviceTokenService).unregisterToken("token-to-remove");
        var body = Map.of("fcmToken", "token-to-remove", "platform", "ios");

        mockMvc.perform(delete("/api/v1/devices/register-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(deviceTokenService).unregisterToken("token-to-remove");
    }
}
