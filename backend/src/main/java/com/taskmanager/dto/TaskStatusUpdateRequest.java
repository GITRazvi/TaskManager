// File responsibility: Defines the validated request body for changing a task status.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull
        TaskStatus status
) {
}
