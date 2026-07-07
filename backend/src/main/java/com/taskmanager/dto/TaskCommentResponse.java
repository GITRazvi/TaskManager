// File responsibility: Defines the task comment API response and conversion from TaskComment entities.
package com.taskmanager.dto;

import com.taskmanager.entity.TaskComment;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskCommentResponse(
        UUID id,
        UUID taskId,
        UUID authorId,
        String authorName,
        String content,
        String attachmentFileName,
        String attachmentContentType,
        Long attachmentSize,
        String attachmentUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Converts a TaskComment entity into an API response with nullable author details.
     */
    public static TaskCommentResponse from(TaskComment comment) {
        var author = comment.getAuthor();
        return new TaskCommentResponse(
                comment.getId(),
                comment.getTask().getId(),
                author == null ? null : author.getId(),
                author == null ? null : (author.getFullName() == null || author.getFullName().isBlank()
                        ? author.getUsername()
                        : author.getFullName()),
                comment.getContent(),
                comment.getAttachmentFileName(),
                comment.getAttachmentContentType(),
                comment.getAttachmentSize(),
                comment.getAttachmentData() == null
                        ? null
                        : "/tasks/" + comment.getTask().getId() + "/comments/" + comment.getId() + "/attachment",
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
