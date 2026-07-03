// File responsibility: Defines the sprint API response and conversion from Sprint entities.
package com.taskmanager.dto;

import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.enums.SprintStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record SprintResponse(
        UUID id,
        UUID userId,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        SprintStatus status,
        int taskCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Converts a Sprint entity into an API response, including user id and task count from the entity relationships.
     */
    public static SprintResponse from(Sprint sprint) {
        return new SprintResponse(
                sprint.getId(),
                sprint.getUser().getId(),
                sprint.getName(),
                sprint.getDescription(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getStatus(),
                sprint.getTasks() == null ? 0 : sprint.getTasks().size(),
                sprint.getCreatedAt(),
                sprint.getUpdatedAt()
        );
    }
}
