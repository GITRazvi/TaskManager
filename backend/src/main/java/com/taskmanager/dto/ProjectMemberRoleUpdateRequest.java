// File responsibility: Defines the request body for changing a project member role.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;

public record ProjectMemberRoleUpdateRequest(
        @NotNull
        ProjectRole role
) {
}
