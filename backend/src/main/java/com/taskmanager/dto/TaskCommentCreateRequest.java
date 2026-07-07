// File responsibility: Defines the validated request body for adding a comment to a task.
package com.taskmanager.dto;

public record TaskCommentCreateRequest(
        String content
) {
}
