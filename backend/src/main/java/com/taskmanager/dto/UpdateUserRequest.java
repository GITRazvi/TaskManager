// File responsibility: Defines the request body for partial user profile updates.
package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 3, max = 50)
        String username,

        @Email
        String email,

        @Size(max = 255)
        String fullName,

        String avatarUrl
) {
}
