// File responsibility: Implements sprint business rules, ownership checks, board grouping, and sprint statistics.
package com.taskmanager.service;

import com.taskmanager.dto.SprintBoardResponse;
import com.taskmanager.dto.SprintCreateRequest;
import com.taskmanager.dto.SprintResponse;
import com.taskmanager.dto.SprintStatsResponse;
import com.taskmanager.dto.SprintUpdateRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.SprintStatus;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.SprintRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SprintService {
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /**
     * Creates the sprint service with sprint, task, and user repositories needed for ownership and board queries.
     */
    public SprintService(
            SprintRepository sprintRepository,
            TaskRepository taskRepository,
            UserRepository userRepository
    ) {
        this.sprintRepository = sprintRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a planning sprint for {@code userId} after validating the request start and end dates.
     */
    @Transactional
    public SprintResponse createSprint(SprintCreateRequest request, UUID userId) {
        validateDates(request.startDate(), request.endDate());
        User user = getUser(userId);

        Sprint sprint = new Sprint();
        sprint.setUser(user);
        sprint.setName(request.name());
        sprint.setDescription(request.description());
        sprint.setStartDate(request.startDate());
        sprint.setEndDate(request.endDate());
        sprint.setStatus(SprintStatus.PLANNING);

        return SprintResponse.from(sprintRepository.save(sprint));
    }

    /**
     * Returns all sprints owned by {@code userId}, optionally filtering by the provided sprint {@code status}.
     */
    @Transactional(readOnly = true)
    public List<SprintResponse> getUserSprints(UUID userId, SprintStatus status) {
        List<Sprint> sprints = status == null
                ? sprintRepository.findAllByUserId(userId)
                : sprintRepository.findAllByUserIdAndStatus(userId, status);

        return sprints.stream()
                .map(SprintResponse::from)
                .toList();
    }

    /**
     * Loads one sprint response by {@code sprintId}, requiring that the same sprint belongs to {@code userId}.
     */
    @Transactional(readOnly = true)
    public SprintResponse getSprintById(UUID sprintId, UUID userId) {
        return SprintResponse.from(getOwnedSprint(sprintId, userId));
    }

    /**
     * Updates mutable sprint fields, using existing dates when request dates are null before validating the range.
     */
    @Transactional
    public SprintResponse updateSprint(UUID sprintId, UUID userId, SprintUpdateRequest request) {
        Sprint sprint = getOwnedSprint(sprintId, userId);
        LocalDate startDate = request.startDate() == null ? sprint.getStartDate() : request.startDate();
        LocalDate endDate = request.endDate() == null ? sprint.getEndDate() : request.endDate();
        validateDates(startDate, endDate);

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_SPRINT_NAME", "Sprint name cannot be blank");
            }
            sprint.setName(request.name());
        }
        if (request.description() != null) {
            sprint.setDescription(request.description());
        }
        if (request.startDate() != null) {
            sprint.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            sprint.setEndDate(request.endDate());
        }
        if (request.status() != null) {
            sprint.setStatus(request.status());
        }

        return SprintResponse.from(sprint);
    }

    /**
     * Builds a sprint board for {@code sprintId} by grouping its tasks by status after confirming user ownership.
     */
    @Transactional(readOnly = true)
    public SprintBoardResponse getSprintBoard(UUID sprintId, UUID userId) {
        getOwnedSprint(sprintId, userId);
        Map<TaskStatus, List<TaskResponse>> tasksByStatus = taskRepository.findAllBySprintId(sprintId).stream()
                .collect(Collectors.groupingBy(Task::getStatus, () -> new EnumMap<>(TaskStatus.class),
                        Collectors.mapping(TaskResponse::from, Collectors.toList())));

        return new SprintBoardResponse(
                sprintId,
                tasksByStatus.getOrDefault(TaskStatus.TODO, List.of()),
                tasksByStatus.getOrDefault(TaskStatus.IN_PROGRESS, List.of()),
                tasksByStatus.getOrDefault(TaskStatus.DONE, List.of())
        );
    }

    /**
     * Calculates sprint totals from task status and priority; completion percentage is based on done over total tasks.
     */
    @Transactional(readOnly = true)
    public SprintStatsResponse getSprintStats(UUID sprintId, UUID userId) {
        getOwnedSprint(sprintId, userId);
        List<Task> tasks = taskRepository.findAllBySprintId(sprintId);
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();
        double completionPercentage = totalTasks == 0 ? 0 : (completedTasks * 100.0) / totalTasks;

        Map<TaskPriority, Long> tasksByPriority = tasks.stream()
                .collect(Collectors.groupingBy(Task::getPriority, () -> new EnumMap<>(TaskPriority.class), Collectors.counting()));

        return new SprintStatsResponse(
                sprintId,
                totalTasks,
                completedTasks,
                completionPercentage,
                completedTasks,
                tasksByPriority
        );
    }

    /**
     * Finds a sprint by both {@code sprintId} and {@code userId}, preventing cross-user access to sprint data.
     */
    private Sprint getOwnedSprint(UUID sprintId, UUID userId) {
        return sprintRepository.findByIdAndUserId(sprintId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));
    }

    /**
     * Loads an active user by {@code userId}; inactive or missing users are treated as not found.
     */
    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Validates required sprint dates and ensures {@code endDate} is strictly after {@code startDate}.
     */
    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_SPRINT_DATES", "Sprint start and end dates are required");
        }
        if (!endDate.isAfter(startDate)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_SPRINT_DATES", "Sprint end date must be after start date");
        }
    }
}
