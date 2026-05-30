package com.hrapp.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrapp.auth.dto.AuthResponse;
import com.hrapp.auth.dto.RegisterRequest;
import com.hrapp.auth.dto.UserInfo;
import com.hrapp.common.exception.BusinessException;
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

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock  AuthService authService;
    @InjectMocks AuthController authController;

    private MockMvc mvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final UUID COMPANY_ID = UUID.randomUUID();
    private static final UUID USER_ID    = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private AuthResponse stubResponse() {
        return new AuthResponse(
                "access-token",
                "refresh-token",
                new UserInfo(USER_ID, "hr@acme.com", "HR_ADMIN", COMPANY_ID)
        );
    }

    @Test
    void register_201_onValidRequest() throws Exception {
        when(authService.register(any())).thenReturn(stubResponse());

        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new RegisterRequest("Acme Ltd", "hr@acme.com", "Password123!"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.user.email").value("hr@acme.com"))
                .andExpect(jsonPath("$.data.user.role").value("HR_ADMIN"));
    }

    @Test
    void register_400_whenEmailAlreadyRegistered() throws Exception {
        when(authService.register(any()))
                .thenThrow(new BusinessException("EMAIL_ALREADY_REGISTERED", "An account with this email already exists"));

        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new RegisterRequest("Acme Ltd", "hr@acme.com", "Password123!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("EMAIL_ALREADY_REGISTERED"));
    }

    @Test
    void register_400_whenCompanyNameMissing() throws Exception {
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"hr@acme.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void register_400_whenEmailInvalid() throws Exception {
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new RegisterRequest("Acme Ltd", "not-an-email", "Password123!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void register_400_whenPasswordTooShort() throws Exception {
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new RegisterRequest("Acme Ltd", "hr@acme.com", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void register_400_whenCompanyNameTooShort() throws Exception {
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new RegisterRequest("A", "hr@acme.com", "Password123!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }
}
