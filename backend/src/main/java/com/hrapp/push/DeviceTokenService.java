package com.hrapp.push;

import com.hrapp.common.multitenancy.TenantContext;
import com.hrapp.company.Company;
import com.hrapp.company.CompanyRepository;
import com.hrapp.user.User;
import com.hrapp.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public void registerToken(String fcmToken, String platform) {
        UUID userId = currentUserId();
        UUID companyId = TenantContext.getCurrentCompany();

        deviceTokenRepository.findByUserIdAndFcmToken(userId, fcmToken).ifPresentOrElse(
                existing -> {
                    existing.setUpdatedAt(Instant.now());
                    deviceTokenRepository.save(existing);
                },
                () -> {
                    User user = userRepository.getReferenceById(userId);
                    Company company = companyRepository.getReferenceById(companyId);
                    DeviceToken token = new DeviceToken();
                    token.setUser(user);
                    token.setCompany(company);
                    token.setFcmToken(fcmToken);
                    token.setPlatform(platform);
                    deviceTokenRepository.save(token);
                }
        );
    }

    @Transactional
    public void unregisterToken(String fcmToken) {
        UUID userId = currentUserId();
        deviceTokenRepository.deleteByUserIdAndFcmToken(userId, fcmToken);
    }

    public List<String> getTokensForUser(UUID userId) {
        return deviceTokenRepository.findAllByUserId(userId)
                .stream()
                .map(DeviceToken::getFcmToken)
                .toList();
    }

    private UUID currentUserId() {
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(name);
    }
}
