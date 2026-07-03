// File responsibility: Defines the authentication response containing JWT credentials and the authenticated user profile.
package com.taskmanager.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
