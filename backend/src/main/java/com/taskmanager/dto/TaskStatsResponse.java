// File responsibility: Defines aggregate task statistics for dashboard-wide metrics.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import java.util.Map;
import java.util.UUID;

public record TaskStatsResponse(
        UUID projectId,
        String projectName,
        long totalTasks,
        long completedTasks,
        double completionPercentage,
        long completedStoryPoints,
        long remainingStoryPoints,
        long totalStoryPoints,
        long overdueTasks,
        Map<TaskStatus, Long> tasksByStatus,
        Map<TaskPriority, Long> tasksByPriority
) {
}
