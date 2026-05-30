package com.hrapp.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @Mock
    UserRepository userRepository;

    @Test
    void findByResetToken_returnsUser_whenTokenMatches() {
        User user = new User();
        user.setEmail("reset@testco.com");
        user.setResetToken("my-reset-token");
        user.setResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));

        when(userRepository.findByResetToken("my-reset-token")).thenReturn(Optional.of(user));

        Optional<User> result = userRepository.findByResetToken("my-reset-token");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("reset@testco.com");
    }

    @Test
    void findByResetToken_returnsEmpty_whenTokenNotFound() {
        when(userRepository.findByResetToken("nonexistent")).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findByResetToken("nonexistent");

        assertThat(result).isEmpty();
    }
}
