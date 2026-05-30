package com.hrapp.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    private static final String SECRET = "test-secret-minimum-256-bits-for-hmac-sha-algorithm-testing";
    private static final UUID USER_ID    = UUID.randomUUID();
    private static final UUID COMPANY_ID = UUID.randomUUID();
    private static final String EMAIL    = "test@company.com";

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "secret", SECRET);
        ReflectionTestUtils.setField(provider, "accessTokenExpiryMs",  3_600_000L);
        ReflectionTestUtils.setField(provider, "refreshTokenExpiryMs", 604_800_000L);
    }

    @Test
    void generateAccessToken_embedsAllClaims() {
        String token = provider.generateAccessToken(EMAIL, USER_ID, COMPANY_ID, "HR_ADMIN");

        assertThat(provider.extractEmail(token)).isEqualTo(EMAIL);
        assertThat(provider.extractCompanyId(token)).isEqualTo(COMPANY_ID);
        assertThat(provider.extractUserId(token)).isEqualTo(USER_ID);
    }

    @Test
    void isTokenValid_returnsTrueForFreshToken() {
        String token = provider.generateAccessToken(EMAIL, USER_ID, COMPANY_ID, "HR_ADMIN");
        UserDetails ud = User.withUsername(EMAIL).password("x").authorities(List.of()).build();

        assertThat(provider.isTokenValid(token, ud)).isTrue();
    }

    @Test
    void isTokenValid_returnsFalseForDifferentUser() {
        String token = provider.generateAccessToken(EMAIL, USER_ID, COMPANY_ID, "HR_ADMIN");
        UserDetails ud = User.withUsername("other@company.com").password("x").authorities(List.of()).build();

        assertThat(provider.isTokenValid(token, ud)).isFalse();
    }

    @Test
    void generateRefreshToken_doesNotContainCompanyId() {
        String token = provider.generateRefreshToken(EMAIL);

        assertThat(provider.extractEmail(token)).isEqualTo(EMAIL);
        assertThatThrownBy(() -> provider.extractCompanyId(token))
                .isInstanceOf(Exception.class);
    }

    @Test
    void extractEmail_throwsOnGarbageToken() {
        assertThatThrownBy(() -> provider.extractEmail("not.a.jwt"))
                .isInstanceOf(Exception.class);
    }
}
