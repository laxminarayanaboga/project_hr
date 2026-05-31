package com.hrapp.push;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

    Optional<DeviceToken> findByUserIdAndFcmToken(UUID userId, String fcmToken);

    List<DeviceToken> findAllByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM DeviceToken dt WHERE dt.user.id = :userId AND dt.fcmToken = :fcmToken")
    void deleteByUserIdAndFcmToken(UUID userId, String fcmToken);
}
