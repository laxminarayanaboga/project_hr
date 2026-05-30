package com.hrapp.common.multitenancy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantContextTest {

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void setAndGet_returnsCorrectCompanyId() {
        UUID id = UUID.randomUUID();
        TenantContext.setCurrentCompany(id);
        assertThat(TenantContext.getCurrentCompany()).isEqualTo(id);
    }

    @Test
    void clear_removesTheValue() {
        TenantContext.setCurrentCompany(UUID.randomUUID());
        TenantContext.clear();

        assertThatThrownBy(TenantContext::getCurrentCompany)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No tenant context");
    }

    @Test
    void get_withoutSet_throwsIllegalState() {
        assertThatThrownBy(TenantContext::getCurrentCompany)
                .isInstanceOf(IllegalStateException.class);
    }
}
