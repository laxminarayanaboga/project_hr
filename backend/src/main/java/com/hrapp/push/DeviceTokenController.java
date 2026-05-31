package com.hrapp.push;

import com.hrapp.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    @PostMapping("/register-token")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody DeviceTokenRequest request) {
        deviceTokenService.registerToken(request.fcmToken(), request.platform());
        return ResponseEntity.ok(ApiResponse.success(null, "Token registered"));
    }

    @DeleteMapping("/register-token")
    public ResponseEntity<ApiResponse<Void>> unregister(
            @Valid @RequestBody DeviceTokenRequest request) {
        deviceTokenService.unregisterToken(request.fcmToken());
        return ResponseEntity.ok(ApiResponse.success(null, "Token removed"));
    }
}
