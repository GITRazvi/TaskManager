// File responsibility: Defines the sprint board response grouped by task workflow status.
package com.taskmanager.dto;

import java.util.List;
import java.util.UUID;

public record SprintBoardResponse(
        UUID sprintId,
        List<TaskResponse> todo,
        List<TaskResponse> inProgress,
        List<TaskResponse> review,
        List<TaskResponse> done
) {
}
