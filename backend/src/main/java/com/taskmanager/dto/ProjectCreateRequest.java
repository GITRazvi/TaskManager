// File responsibility: Defines the validated request body for creating a project.
package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectCreateRequest(
        @NotBlank
        @Size(max = 255)
        String name,

        String description
) {
}
