package com.hrapp.common.multitenancy;

import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_COMPANY = new ThreadLocal<>();

    private TenantContext() {}

    public static void setCurrentCompany(UUID companyId) {
        CURRENT_COMPANY.set(companyId);
    }

    public static UUID getCurrentCompany() {
        UUID companyId = CURRENT_COMPANY.get();
        if (companyId == null) {
            throw new IllegalStateException("No tenant context set for current request");
        }
        return companyId;
    }

    public static void clear() {
        CURRENT_COMPANY.remove();
    }
}
