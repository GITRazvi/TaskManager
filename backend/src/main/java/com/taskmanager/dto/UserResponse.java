// File responsibility: Defines the safe public user response returned by profile and auth APIs.
package com.taskmanager.dto;

import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.UserRole;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String fullName,
        String avatarUrl,
        UserRole role,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Converts a User entity into a safe API response without exposing the password hash.
     */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
