// File responsibility: Defines the request body for adding a user to a project with a role.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.ProjectRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectMemberCreateRequest(
        @NotBlank
        @Size(max = 255)
        String userIdentifier,

        @NotNull
        ProjectRole role
) {
}
