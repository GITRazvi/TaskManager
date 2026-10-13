// File responsibility: Defines the project member API response with user identity and project role.
package com.taskmanager.dto;

import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.enums.ProjectRole;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectMemberResponse(
        UUID id,
        UUID projectId,
        UUID userId,
        String username,
        String email,
        String fullName,
        String avatarUrl,
        ProjectRole role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProjectMemberResponse from(ProjectMember member) {
        var user = member.getUser();
        return new ProjectMemberResponse(
                member.getId(),
                member.getProject().getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                member.getRole(),
                member.getCreatedAt(),
                member.getUpdatedAt()
        );
    }
}
