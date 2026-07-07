// File responsibility: Defines the project API response and conversion from Project entities.
package com.taskmanager.dto;

import com.taskmanager.entity.Project;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID userId,
        String name,
        String description,
        int sprintCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getUser().getId(),
                project.getName(),
                project.getDescription(),
                project.getSprints() == null ? 0 : project.getSprints().size(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
