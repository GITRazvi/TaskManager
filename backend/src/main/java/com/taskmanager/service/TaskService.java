// File responsibility: Implements task creation, filtering, updates, deletion, status changes, and validation.
package com.taskmanager.service;

import com.taskmanager.dto.TaskCreateRequest;
import com.taskmanager.dto.TaskListResponse;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskUpdateRequest;
import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.SprintRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;

    /**
     * Creates the task service with repositories used for task persistence, user lookup, and sprint ownership checks.
     */
    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            SprintRepository sprintRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.sprintRepository = sprintRepository;
    }

    /**
     * Creates a task for {@code userId}, resolving optional sprint and assignee ids and defaulting status/priority.
     */
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request, UUID userId) {
        validateDueDate(request.dueDate());
        User user = getUser(userId);

        Task task = new Task();
        task.setUser(user);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(request.dueDate());
        task.setSprint(resolveSprint(request.sprintId(), userId));
        task.setAssignedTo(resolveAssignedTo(request.assignedToId(), userId));

        return TaskResponse.from(taskRepository.save(task));
    }

    /**
     * Returns a page of tasks for {@code userId}, filtered by status, priority, due-date bounds, page, and size.
     */
    @Transactional(readOnly = true)
    public TaskListResponse getUserTasks(
            UUID userId,
            TaskStatus status,
            TaskPriority priority,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Task> tasks = taskRepository.findAll(buildFilter(userId, status, priority, startDate, endDate), pageable);

        return new TaskListResponse(
                tasks.map(TaskResponse::from).toList(),
                tasks.getNumber(),
                tasks.getSize(),
                tasks.getTotalElements(),
                tasks.getTotalPages()
        );
    }

    /**
     * Loads a single task response by {@code taskId}, requiring that the task belongs to {@code userId}.
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID taskId, UUID userId) {
        return TaskResponse.from(getOwnedTask(taskId, userId));
    }

    /**
     * Applies non-null updates to an owned task, validating title, due date, sprint ownership, and assignee identity.
     */
    @Transactional
    public TaskResponse updateTask(UUID taskId, UUID userId, TaskUpdateRequest request) {
        validateDueDate(request.dueDate());
        Task task = getOwnedTask(taskId, userId);

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_TASK_TITLE", "Task title cannot be blank");
            }
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.sprintId() != null) {
            task.setSprint(resolveSprint(request.sprintId(), userId));
        }
        if (request.assignedToId() != null) {
            task.setAssignedTo(resolveAssignedTo(request.assignedToId(), userId));
        }

        return TaskResponse.from(task);
    }

    /**
     * Deletes the task identified by {@code taskId} only when it is owned by {@code userId}.
     */
    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        taskRepository.delete(getOwnedTask(taskId, userId));
    }

    /**
     * Updates the owned task's workflow {@code status} and returns the refreshed response.
     */
    @Transactional
    public TaskResponse updateStatus(UUID taskId, UUID userId, TaskStatus status) {
        Task task = getOwnedTask(taskId, userId);
        task.setStatus(status);
        return TaskResponse.from(task);
    }

    /**
     * Finds a task by both {@code taskId} and {@code userId}, enforcing task ownership before reads or writes.
     */
    private Task getOwnedTask(UUID taskId, UUID userId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    /**
     * Loads an active user by {@code userId}; missing or inactive users cannot own new tasks.
     */
    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Resolves an optional {@code sprintId} to a sprint owned by {@code userId}, returning null when unassigned.
     */
    private Sprint resolveSprint(UUID sprintId, UUID userId) {
        if (sprintId == null) {
            return null;
        }
        return sprintRepository.findByIdAndUserId(sprintId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));
    }

    /**
     * Resolves an optional assignee; {@code assignedToId} must match {@code userId} because self-assignment only is allowed.
     */
    private User resolveAssignedTo(UUID assignedToId, UUID userId) {
        if (assignedToId == null) {
            return null;
        }
        if (!assignedToId.equals(userId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_ASSIGNEE", "Tasks can only be assigned to the current user");
        }
        return getUser(assignedToId);
    }

    /**
     * Rejects a non-null {@code dueDate} when it is before the current local date.
     */
    private void validateDueDate(LocalDate dueDate) {
        if (dueDate != null && dueDate.isBefore(LocalDate.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DUE_DATE", "Due date cannot be in the past");
        }
    }

    /**
     * Builds the JPA specification for task search using owner id plus optional status, priority, and due-date bounds.
     */
    private Specification<Task> buildFilter(
            UUID userId,
            TaskStatus status,
            TaskPriority priority,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dueDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dueDate"), endDate));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
