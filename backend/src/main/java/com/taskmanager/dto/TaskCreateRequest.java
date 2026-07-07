// File responsibility: Defines the validated request body for creating a task.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TaskCreateRequest(
        @NotBlank
        @Size(max = 255)
        String title,

        String description,
        TaskPriority priority,
        LocalDate dueDate,
        UUID sprintId,
        UUID assignedToId,
        UUID reviewerId,
        @PositiveOrZero
        Integer storyPoints,
        @PositiveOrZero
        BigDecimal estimatedHours,
        String comments
) {
}
