// File responsibility: Defines the admin request body for changing a user's application role.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull
        UserRole role
) {
}
