// File responsibility: Defines sprint statistics returned by the sprint stats endpoint.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.TaskPriority;
import java.util.Map;
import java.util.UUID;

public record SprintStatsResponse(
        UUID sprintId,
        long totalTasks,
        long completedTasks,
        double completionPercentage,
        long velocity,
        Map<TaskPriority, Long> tasksByPriority
) {
}
