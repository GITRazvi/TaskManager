// File responsibility: Defines the task API response and conversion from Task entities.
package com.taskmanager.dto;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID userId,
        UUID sprintId,
        UUID assignedToId,
        UUID reviewerId,
        UUID projectId,
        String sprintName,
        String projectName,
        String title,
        String description,
        List<TaskCommentResponse> comments,
        List<TaskStatusHistoryResponse> statusHistory,
        TaskStatus status,
        TaskPriority priority,
        Integer storyPoints,
        BigDecimal estimatedHours,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Converts a Task entity into an API response, exposing nullable sprint and assignee ids when present.
     */
    public static TaskResponse from(Task task) {
        var sprint = task.getSprint();
        var project = sprint == null ? null : sprint.getProject();

        return new TaskResponse(
                task.getId(),
                task.getUser().getId(),
                sprint == null ? null : sprint.getId(),
                task.getAssignedTo() == null ? null : task.getAssignedTo().getId(),
                task.getReviewer() == null ? null : task.getReviewer().getId(),
                project == null ? null : project.getId(),
                sprint == null ? null : sprint.getName(),
                project == null ? null : project.getName(),
                task.getTitle(),
                task.getDescription(),
                task.getComments() == null ? List.of() : task.getComments().stream().map(TaskCommentResponse::from).toList(),
                task.getStatusHistory() == null ? List.of() : task.getStatusHistory().stream().map(TaskStatusHistoryResponse::from).toList(),
                task.getStatus(),
                task.getPriority(),
                task.getStoryPoints(),
                task.getEstimatedHours(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
