// File responsibility: Defines the admin request body for creating users with explicit roles.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        String username,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        @Size(max = 255)
        String fullName,

        @NotNull
        UserRole role
) {
}
