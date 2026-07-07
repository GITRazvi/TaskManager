// File responsibility: Defines the request body for partial project updates.
package com.taskmanager.dto;

import jakarta.validation.constraints.Size;

public record ProjectUpdateRequest(
        @Size(max = 255)
        String name,

        String description
) {
}
