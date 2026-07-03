// File responsibility: Defines the validated request body for creating a sprint.
package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record SprintCreateRequest(
        @NotBlank
        @Size(max = 255)
        String name,

        String description,

        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate
) {
}
