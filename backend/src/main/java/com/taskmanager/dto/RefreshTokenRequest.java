// File responsibility: Defines the validated request body for refreshing JWT credentials.
package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank
        String refreshToken
) {
}
