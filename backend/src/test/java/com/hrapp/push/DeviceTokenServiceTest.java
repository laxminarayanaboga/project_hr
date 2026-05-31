package com.hrapp.push;

import com.hrapp.company.Company;
import com.hrapp.company.CompanyRepository;
import com.hrapp.user.User;
import com.hrapp.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeviceTokenServiceTest {

    @Mock
    private DeviceTokenRepository deviceTokenRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private DeviceTokenService service;

    private UUID userId;
    private UUID companyId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        companyId = UUID.randomUUID();

        var auth = new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        com.hrapp.common.multitenancy.TenantContext.setCurrentCompany(companyId);
    }

    @Test
    void registerToken_savesNewToken_whenNotExists() {
        when(deviceTokenRepository.findByUserIdAndFcmToken(userId, "token-abc"))
                .thenReturn(Optional.empty());
        when(userRepository.getReferenceById(userId)).thenReturn(new User());
        when(companyRepository.getReferenceById(companyId)).thenReturn(new Company());

        service.registerToken("token-abc", "android");

        ArgumentCaptor<DeviceToken> captor = ArgumentCaptor.forClass(DeviceToken.class);
        verify(deviceTokenRepository).save(captor.capture());
        assertThat(captor.getValue().getFcmToken()).isEqualTo("token-abc");
        assertThat(captor.getValue().getPlatform()).isEqualTo("android");
    }

    @Test
    void registerToken_updatesTimestamp_whenTokenAlreadyExists() {
        DeviceToken existing = new DeviceToken();
        existing.setFcmToken("token-abc");
        when(deviceTokenRepository.findByUserIdAndFcmToken(userId, "token-abc"))
                .thenReturn(Optional.of(existing));

        service.registerToken("token-abc", "ios");

        verify(deviceTokenRepository).save(existing);
        verify(userRepository, never()).getReferenceById(any());
    }

    @Test
    void getTokensForUser_returnsTokenStrings() {
        DeviceToken t1 = new DeviceToken();
        t1.setFcmToken("token-1");
        DeviceToken t2 = new DeviceToken();
        t2.setFcmToken("token-2");
        when(deviceTokenRepository.findAllByUserId(userId)).thenReturn(List.of(t1, t2));

        List<String> tokens = service.getTokensForUser(userId);

        assertThat(tokens).containsExactly("token-1", "token-2");
    }

    @Test
    void getTokensForUser_returnsEmpty_whenNoTokens() {
        when(deviceTokenRepository.findAllByUserId(userId)).thenReturn(List.of());

        List<String> tokens = service.getTokensForUser(userId);

        assertThat(tokens).isEmpty();
    }

    @Test
    void unregisterToken_deletesToken() {
        service.unregisterToken("token-abc");

        verify(deviceTokenRepository).deleteByUserIdAndFcmToken(userId, "token-abc");
    }
}
