// File responsibility: Defines the task status history API response and conversion from status history entities.
package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatusHistory;
import com.taskmanager.entity.enums.TaskStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskStatusHistoryResponse(
        UUID id,
        UUID taskId,
        TaskStatus fromStatus,
        TaskStatus toStatus,
        UUID changedById,
        String changedByName,
        LocalDateTime createdAt
) {
    /**
     * Converts a TaskStatusHistory entity into an API response with nullable actor details.
     */
    public static TaskStatusHistoryResponse from(TaskStatusHistory history) {
        var changedBy = history.getChangedBy();
        return new TaskStatusHistoryResponse(
                history.getId(),
                history.getTask().getId(),
                history.getFromStatus(),
                history.getToStatus(),
                changedBy == null ? null : changedBy.getId(),
                changedBy == null ? null : (changedBy.getFullName() == null || changedBy.getFullName().isBlank()
                        ? changedBy.getUsername()
                        : changedBy.getFullName()),
                history.getCreatedAt()
        );
    }
}
