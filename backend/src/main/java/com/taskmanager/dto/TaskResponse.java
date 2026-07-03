// File responsibility: Defines the task API response and conversion from Task entities.
package com.taskmanager.dto;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID userId,
        UUID sprintId,
        UUID assignedToId,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Converts a Task entity into an API response, exposing nullable sprint and assignee ids when present.
     */
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getUser().getId(),
                task.getSprint() == null ? null : task.getSprint().getId(),
                task.getAssignedTo() == null ? null : task.getAssignedTo().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
