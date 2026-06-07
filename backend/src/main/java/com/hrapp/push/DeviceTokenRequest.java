package com.hrapp.push;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DeviceTokenRequest(
        @NotBlank String fcmToken,
        @NotBlank @Pattern(regexp = "ios|android") String platform
) {}
