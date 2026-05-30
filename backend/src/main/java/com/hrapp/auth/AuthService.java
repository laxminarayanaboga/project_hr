package com.hrapp.auth;

import com.hrapp.auth.dto.AuthResponse;
import com.hrapp.auth.dto.RegisterRequest;
import com.hrapp.auth.dto.UserInfo;
import com.hrapp.common.exception.BusinessException;
import com.hrapp.company.Company;
import com.hrapp.company.CompanyRepository;
import com.hrapp.user.User;
import com.hrapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("EMAIL_ALREADY_REGISTERED", "An account with this email already exists");
        }

        Company company = new Company();
        company.setName(request.getCompanyName());
        company.setSlug(generateUniqueSlug(request.getCompanyName()));
        company.setEmail(request.getEmail());
        company = companyRepository.save(company);

        User user = new User();
        user.setCompany(company);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("HR_ADMIN");
        user = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getEmail(), user.getId(), company.getId(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), company.getName());

        return new AuthResponse(accessToken, refreshToken, UserInfo.from(user));
    }

    private String generateUniqueSlug(String companyName) {
        String base = companyName.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
        String slug = base;
        while (companyRepository.existsBySlug(slug)) {
            slug = base + "-" + UUID.randomUUID().toString().substring(0, 6);
        }
        return slug;
    }
}
