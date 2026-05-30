package com.hrapp.auth;

import com.hrapp.auth.dto.AuthResponse;
import com.hrapp.auth.dto.LoginRequest;
import com.hrapp.auth.dto.RegisterRequest;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.company.Company;
import com.hrapp.company.CompanyRepository;
import com.hrapp.user.User;
import com.hrapp.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock CompanyRepository companyRepository;
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock EmailService emailService;

    @InjectMocks AuthService authService;

    private static final String EMAIL    = "hr@acme.com";
    private static final String PASSWORD = "Password123!";
    private static final UUID   COMP_ID  = UUID.randomUUID();
    private static final UUID   USER_ID  = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        when(companyRepository.existsBySlug(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");
        when(jwtTokenProvider.generateAccessToken(any(), any(), any(), any())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token");

        Company savedCompany = new Company();
        savedCompany.setId(COMP_ID);
        savedCompany.setName("Acme Ltd");
        savedCompany.setSlug("acme-ltd");
        savedCompany.setEmail(EMAIL);
        when(companyRepository.save(any(Company.class))).thenReturn(savedCompany);

        User savedUser = new User();
        savedUser.setId(USER_ID);
        savedUser.setEmail(EMAIL);
        savedUser.setRole("HR_ADMIN");
        savedUser.setCompany(savedCompany);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
    }

    @Test
    void register_happyPath_returnsTokensAndUserInfo() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

        AuthResponse result = authService.register(new RegisterRequest("Acme Ltd", EMAIL, PASSWORD));

        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(result.getUser().getEmail()).isEqualTo(EMAIL);
        assertThat(result.getUser().getRole()).isEqualTo("HR_ADMIN");
        assertThat(result.getUser().getCompanyId()).isEqualTo(COMP_ID);
    }

    @Test
    void register_persistsCompanyAndUser() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

        authService.register(new RegisterRequest("Acme Ltd", EMAIL, PASSWORD));

        verify(companyRepository).save(argThat(c ->
                c.getName().equals("Acme Ltd") && c.getEmail().equals(EMAIL)));
        verify(userRepository, atLeast(1)).save(argThat(u ->
                u.getEmail().equals(EMAIL) && u.getRole().equals("HR_ADMIN")));
    }

    @Test
    void register_passwordIsHashed() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

        authService.register(new RegisterRequest("Acme Ltd", EMAIL, PASSWORD));

        verify(passwordEncoder).encode(PASSWORD);
    }

    @Test
    void register_sendsWelcomeEmail() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

        authService.register(new RegisterRequest("Acme Ltd", EMAIL, PASSWORD));

        verify(emailService).sendWelcomeEmail(EMAIL, "Acme Ltd");
    }

    @Test
    void register_throwsBusinessException_whenEmailAlreadyExists() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        assertThatThrownBy(() -> authService.register(new RegisterRequest("Acme Ltd", EMAIL, PASSWORD)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists")
                .extracting("errorCode").isEqualTo("EMAIL_ALREADY_REGISTERED");
    }

    @Test
    void register_appendsSuffix_whenSlugAlreadyExists() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(companyRepository.existsBySlug("acme-ltd")).thenReturn(true);
        when(companyRepository.existsBySlug(argThat(s -> s.startsWith("acme-ltd-")))).thenReturn(false);

        authService.register(new RegisterRequest("Acme Ltd", EMAIL, PASSWORD));

        verify(companyRepository).save(argThat(c -> c.getSlug().startsWith("acme-ltd-")));
    }

    @Test
    void register_generatesSlug_fromCompanyName() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

        authService.register(new RegisterRequest("My Great Company!", EMAIL, PASSWORD));

        verify(companyRepository).save(argThat(c -> c.getSlug().equals("my-great-company")));
    }

    // ── login() ──────────────────────────────────────────────────────────────

    private User loginUser() {
        Company company = new Company();
        company.setId(COMP_ID);
        company.setName("Acme Ltd");

        User user = new User();
        user.setId(USER_ID);
        user.setEmail(EMAIL);
        user.setPasswordHash("hashed-password");
        user.setRole("HR_ADMIN");
        user.setActive(true);
        user.setCompany(company);
        return user;
    }

    @Test
    void login_happyPath_returnsTokensAndUserInfo() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(loginUser()));
        when(passwordEncoder.matches(PASSWORD, "hashed-password")).thenReturn(true);

        AuthResponse result = authService.login(new LoginRequest(EMAIL, PASSWORD));

        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(result.getUser().getEmail()).isEqualTo(EMAIL);
        assertThat(result.getUser().getRole()).isEqualTo("HR_ADMIN");
        assertThat(result.getUser().getCompanyId()).isEqualTo(COMP_ID);
    }

    @Test
    void login_updatesLastLoginAndRefreshToken() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(loginUser()));
        when(passwordEncoder.matches(PASSWORD, "hashed-password")).thenReturn(true);

        authService.login(new LoginRequest(EMAIL, PASSWORD));

        verify(userRepository).save(argThat(u -> u.getLastLogin() != null && u.getRefreshToken() != null));
    }

    @Test
    void login_throwsBadCredentials_whenEmailNotFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("nobody@nowhere.com", PASSWORD)))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_throwsBadCredentials_whenPasswordWrong() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(loginUser()));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, "WrongPassword!")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_throwsBadCredentials_whenAccountDisabled() {
        User user = loginUser();
        user.setActive(false);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, "hashed-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD)))
                .isInstanceOf(BadCredentialsException.class);
    }
}
