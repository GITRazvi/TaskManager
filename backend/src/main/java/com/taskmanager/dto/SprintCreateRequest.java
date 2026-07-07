// File responsibility: Defines the validated request body for creating a sprint.
package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SprintCreateRequest(
        @NotBlank
        @Size(max = 255)
        String name,

        String description,

        @NotNull
        UUID projectId,

        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate,

        List<@Size(max = 255) String> participantIdentifiers
) {
}
