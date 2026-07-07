// File responsibility: Defines the sprint API response and conversion from Sprint entities.
package com.taskmanager.dto;

import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.enums.SprintStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record SprintResponse(
        UUID id,
        UUID userId,
        UUID projectId,
        String projectName,
        String creatorName,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        SprintStatus status,
        int taskCount,
        List<UserResponse> participants,
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
                sprint.getProject().getId(),
                sprint.getProject().getName(),
                displayName(sprint.getUser()),
                sprint.getName(),
                sprint.getDescription(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getStatus(),
                sprint.getTasks() == null ? 0 : sprint.getTasks().size(),
                sprint.getParticipants() == null ? List.of() : sprint.getParticipants().stream()
                        .map(UserResponse::from)
                        .sorted(Comparator.comparing(UserResponse::username, String.CASE_INSENSITIVE_ORDER))
                        .toList(),
                sprint.getCreatedAt(),
                sprint.getUpdatedAt()
        );
    }

    private static String displayName(com.taskmanager.entity.User user) {
        return user.getFullName() == null || user.getFullName().isBlank()
                ? user.getUsername()
                : user.getFullName();
    }
}
