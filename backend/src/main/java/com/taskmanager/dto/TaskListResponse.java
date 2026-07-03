// File responsibility: Defines paginated task-list responses returned by task search.
package com.taskmanager.dto;

import java.util.List;

public record TaskListResponse(
        List<TaskResponse> tasks,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
