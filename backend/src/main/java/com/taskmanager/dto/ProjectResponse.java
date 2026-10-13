// File responsibility: Defines the project API response and conversion from Project entities.
package com.taskmanager.dto;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.enums.ProjectRole;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID userId,
        String name,
        String description,
        int sprintCount,
        ProjectRole role,
        List<ProjectMemberResponse> members,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProjectResponse from(Project project, UUID currentUserId) {
        List<ProjectMemberResponse> members = project.getMembers() == null ? List.of() : project.getMembers().stream()
                .map(ProjectMemberResponse::from)
                .sorted(Comparator.comparing(ProjectMemberResponse::username, String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new ProjectResponse(
                project.getId(),
                project.getUser().getId(),
                project.getName(),
                project.getDescription(),
                project.getSprints() == null ? 0 : project.getSprints().size(),
                projectRole(project, currentUserId),
                members,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public static ProjectResponse from(Project project) {
        return from(project, null);
    }

    private static ProjectRole projectRole(Project project, UUID currentUserId) {
        if (currentUserId == null || project.getMembers() == null) {
            return null;
        }

        return project.getMembers().stream()
                .filter(member -> member.getUser().getId().equals(currentUserId))
                .map(ProjectMember::getRole)
                .findFirst()
                .orElse(null);
    }
}
