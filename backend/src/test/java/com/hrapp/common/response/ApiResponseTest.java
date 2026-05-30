package com.hrapp.common.response;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {

    @Test
    void success_withData_setsFieldsCorrectly() {
        var response = ApiResponse.success("payload", "It worked");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo("payload");
        assertThat(response.getMessage()).isEqualTo("It worked");
        assertThat(response.getError()).isNull();
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    void success_withoutMessage_hasNullMessage() {
        var response = ApiResponse.success(42);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo(42);
        assertThat(response.getMessage()).isNull();
    }

    @Test
    void error_setsSuccessFalseAndNullData() {
        var response = ApiResponse.<Void>error("NOT_FOUND", "Resource not found");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getError()).isEqualTo("NOT_FOUND");
        assertThat(response.getMessage()).isEqualTo("Resource not found");
        assertThat(response.getData()).isNull();
    }
}
