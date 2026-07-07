// File responsibility: Defines the request body for partial task updates.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TaskUpdateRequest(
        @Size(max = 255)
        String title,

        String description,
        TaskStatus status,
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
