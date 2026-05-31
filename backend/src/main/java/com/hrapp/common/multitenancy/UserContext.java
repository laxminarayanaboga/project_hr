package com.hrapp.common.multitenancy;

import java.util.UUID;

public final class UserContext {

    private static final ThreadLocal<UUID> CURRENT_USER = new ThreadLocal<>();

    private UserContext() {}

    public static void setCurrentUser(UUID userId) {
        CURRENT_USER.set(userId);
    }

    public static UUID getCurrentUser() {
        UUID userId = CURRENT_USER.get();
        if (userId == null) {
            throw new IllegalStateException("No user context set for current request");
        }
        return userId;
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
