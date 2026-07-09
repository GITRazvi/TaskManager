// File responsibility: Implements task creation, filtering, updates, deletion, status changes, and validation.
package com.taskmanager.service;

import com.taskmanager.dto.TaskCommentCreateRequest;
import com.taskmanager.dto.TaskCommentAttachment;
import com.taskmanager.dto.TaskCommentResponse;
import com.taskmanager.dto.TaskCreateRequest;
import com.taskmanager.dto.TaskListResponse;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskStatsResponse;
import com.taskmanager.dto.TaskUpdateRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskComment;
import com.taskmanager.entity.TaskStatusHistory;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.SprintRepository;
import com.taskmanager.repository.TaskCommentRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TaskStatusHistoryRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TaskService {
    private static final long MAX_COMMENT_ATTACHMENT_BYTES = 10L * 1024L * 1024L;

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final TaskStatusHistoryRepository taskStatusHistoryRepository;

    /**
     * Creates the task service with repositories used for task persistence, user lookup, and sprint ownership checks.
     */
    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            SprintRepository sprintRepository,
            TaskCommentRepository taskCommentRepository,
            TaskStatusHistoryRepository taskStatusHistoryRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.sprintRepository = sprintRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.taskStatusHistoryRepository = taskStatusHistoryRepository;
    }

    /**
     * Creates a task for {@code userId}, resolving optional sprint and assignee ids and defaulting status/priority.
     */
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request, UUID userId, UserRole userRole) {
        validateDueDate(request.dueDate());
        User user = getUser(userId);
        validateDeveloperCreateRequest(request, userId, userRole);

        Task task = new Task();
        Sprint sprint = resolveSprint(request.sprintId(), userId);
        task.setUser(user);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(request.dueDate());
        task.setSprint(sprint);
        task.setAssignedTo(resolveAssignedTo(request.assignedToId()));
        task.setReviewer(resolveReviewer(request.reviewerId(), sprint));
        task.setStoryPoints(validateStoryPoints(request.storyPoints()));
        task.setEstimatedHours(validateEstimatedHours(request.estimatedHours()));
        Task savedTask = taskRepository.save(task);
        addStatusHistory(savedTask, null, savedTask.getStatus(), user);
        addCommentIfPresent(savedTask, user, request.comments());

        return TaskResponse.from(savedTask);
    }

    /**
     * Returns a page of tasks for {@code userId}, filtered by status, priority, assignee, due-date bounds, page, and size.
     */
    @Transactional(readOnly = true)
    public TaskListResponse getUserTasks(
            UUID userId,
            TaskStatus status,
            TaskPriority priority,
            UUID assignedToId,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Task> tasks = taskRepository.findAll(
                buildFilter(userId, status, priority, assignedToId, startDate, endDate),
                pageable
        );

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
        return TaskResponse.from(getVisibleTask(taskId, userId));
    }

    /**
     * Calculates aggregate metrics for all tasks visible to {@code userId} across projects and sprints.
     */
    @Transactional(readOnly = true)
    public List<TaskStatsResponse> getTaskStats(UUID userId) {
        List<Task> tasks = taskRepository.findAll(buildFilter(userId, null, null, null, null, null));
        Map<UUID, Project> projectsById = sprintRepository.findAllAccessibleByUserId(userId).stream()
                .map(Sprint::getProject)
                .filter(project -> project != null)
                .collect(Collectors.toMap(
                        Project::getId,
                        project -> project,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
        Map<UUID, List<Task>> tasksByProjectId = tasks.stream()
                .filter(task -> task.getSprint() != null && task.getSprint().getProject() != null)
                .collect(Collectors.groupingBy(task -> task.getSprint().getProject().getId()));

        return projectsById.values().stream()
                .map(project -> buildTaskStats(
                        project,
                        tasksByProjectId.getOrDefault(project.getId(), List.of())
                ))
                .toList();
    }

    private TaskStatsResponse buildTaskStats(Project project, List<Task> tasks) {
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();
        double completionPercentage = totalTasks == 0 ? 0 : (completedTasks * 100.0) / totalTasks;
        LocalDate today = LocalDate.now();
        long completedStoryPoints = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .mapToLong(task -> task.getStoryPoints() == null ? 0 : task.getStoryPoints())
                .sum();
        long remainingStoryPoints = tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .mapToLong(task -> task.getStoryPoints() == null ? 0 : task.getStoryPoints())
                .sum();
        long overdueTasks = tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(today))
                .count();
        Map<TaskStatus, Long> tasksByStatus = tasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, () -> new EnumMap<>(TaskStatus.class), Collectors.counting()));
        Map<TaskPriority, Long> tasksByPriority = tasks.stream()
                .collect(Collectors.groupingBy(Task::getPriority, () -> new EnumMap<>(TaskPriority.class), Collectors.counting()));

        return new TaskStatsResponse(
                project.getId(),
                project.getName(),
                totalTasks,
                completedTasks,
                completionPercentage,
                completedStoryPoints,
                remainingStoryPoints,
                completedStoryPoints + remainingStoryPoints,
                overdueTasks,
                tasksByStatus,
                tasksByPriority
        );
    }

    /**
     * Applies non-null updates to a visible task, validating title, due date, sprint access, and assignee identity.
     */
    @Transactional
    public TaskResponse updateTask(UUID taskId, UUID userId, UserRole userRole, TaskUpdateRequest request) {
        validateDueDate(request.dueDate());
        Task task = getVisibleTask(taskId, userId);
        ensureCanUpdateTask(task, userId, userRole, request);
        validateTaskUpdatePermissions(request, task, userId, userRole);

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
            changeStatus(task, request.status(), getUser(userId));
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        Sprint sprintForReviewer = task.getSprint();
        if (request.sprintId() != null) {
            sprintForReviewer = resolveSprint(request.sprintId(), userId);
            task.setSprint(sprintForReviewer);
        }
        if (request.assignedToId() != null) {
            task.setAssignedTo(resolveAssignedTo(request.assignedToId()));
        }
        if (request.reviewerId() != null) {
            task.setReviewer(resolveReviewer(request.reviewerId(), sprintForReviewer));
        } else if (request.sprintId() != null && task.getReviewer() != null) {
            task.setReviewer(resolveReviewer(task.getReviewer().getId(), sprintForReviewer));
        }
        if (request.storyPoints() != null) {
            task.setStoryPoints(validateStoryPoints(request.storyPoints()));
        }
        if (request.estimatedHours() != null) {
            task.setEstimatedHours(validateEstimatedHours(request.estimatedHours()));
        }
        if (request.comments() != null) {
            addCommentIfPresent(task, getUser(userId), request.comments());
        }

        return TaskResponse.from(task);
    }

    /**
     * Adds a new comment to a visible task and returns the persisted comment response.
     */
    @Transactional
    public TaskCommentResponse addComment(UUID taskId, UUID userId, TaskCommentCreateRequest request) {
        return addComment(taskId, userId, request.content(), null);
    }

    /**
     * Adds a new visible-task comment with optional attachment metadata and bytes.
     */
    @Transactional
    public TaskCommentResponse addComment(UUID taskId, UUID userId, String content, MultipartFile attachment) {
        Task task = getVisibleTask(taskId, userId);
        User author = getUser(userId);
        TaskComment comment = createComment(task, author, content, attachment);
        task.getComments().add(comment);
        return TaskCommentResponse.from(comment);
    }

    /**
     * Loads a comment attachment from a visible task, returning metadata and raw file bytes.
     */
    @Transactional(readOnly = true)
    public TaskCommentAttachment getCommentAttachment(UUID taskId, UUID commentId, UUID userId) {
        getVisibleTask(taskId, userId);
        TaskComment comment = taskCommentRepository.findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (comment.getAttachmentData() == null) {
            throw new ResourceNotFoundException("Attachment not found");
        }

        return new TaskCommentAttachment(
                comment.getAttachmentFileName(),
                comment.getAttachmentContentType(),
                comment.getAttachmentSize() == null ? comment.getAttachmentData().length : comment.getAttachmentSize(),
                comment.getAttachmentData()
        );
    }

    /**
     * Deletes the task identified by {@code taskId} only when it is owned by {@code userId}.
     */
    @Transactional
    public void deleteTask(UUID taskId, UUID userId, UserRole userRole) {
        Task task = userRole.canEditAnyVisibleTask() ? getVisibleTask(taskId, userId) : getOwnedTask(taskId, userId);
        taskRepository.delete(task);
    }

    /**
     * Updates a visible task's workflow {@code status} and returns the refreshed response.
     */
    @Transactional
    public TaskResponse updateStatus(UUID taskId, UUID userId, TaskStatus status) {
        Task task = getVisibleTask(taskId, userId);
        changeStatus(task, status, getUser(userId));
        return TaskResponse.from(task);
    }

    /**
     * Mutates the task status and appends a history entry only when the workflow state actually changes.
     */
    private void changeStatus(Task task, TaskStatus toStatus, User changedBy) {
        TaskStatus fromStatus = task.getStatus();
        if (fromStatus == toStatus) {
            return;
        }
        task.setStatus(toStatus);
        addStatusHistory(task, fromStatus, toStatus, changedBy);
    }

    /**
     * Appends an immutable status transition to the task history collection and repository.
     */
    private void addStatusHistory(Task task, TaskStatus fromStatus, TaskStatus toStatus, User changedBy) {
        TaskStatusHistory history = new TaskStatusHistory();
        history.setTask(task);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(changedBy);
        TaskStatusHistory savedHistory = taskStatusHistoryRepository.save(history);
        task.getStatusHistory().add(savedHistory == null ? history : savedHistory);
    }

    /**
     * Finds a task by both {@code taskId} and {@code userId}, enforcing task ownership before reads or writes.
     */
    private Task getOwnedTask(UUID taskId, UUID userId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    /**
     * Finds a task visible to {@code userId}, including tasks in sprints the user can access.
     */
    private Task getVisibleTask(UUID taskId, UUID userId) {
        return taskRepository.findVisibleByIdAndUserId(taskId, userId)
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
     * Adds a comment entry when optional comment content is present and non-blank.
     */
    private void addCommentIfPresent(Task task, User author, String content) {
        if (content == null || content.isBlank()) {
            return;
        }
        task.getComments().add(createComment(task, author, content, null));
    }

    /**
     * Creates and persists a trimmed task comment entry.
     */
    private TaskComment createComment(Task task, User author, String rawContent, MultipartFile attachment) {
        boolean hasContent = rawContent != null && !rawContent.isBlank();
        boolean hasAttachment = attachment != null && !attachment.isEmpty();
        if (!hasContent && !hasAttachment) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TASK_COMMENT",
                    "Comment or attachment is required"
            );
        }
        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setContent(hasContent ? rawContent.trim() : "");
        applyAttachment(comment, attachment);
        TaskComment savedComment = taskCommentRepository.save(comment);
        return savedComment == null ? comment : savedComment;
    }

    /**
     * Copies optional upload metadata and bytes onto a comment after validating attachment size.
     */
    private void applyAttachment(TaskComment comment, MultipartFile attachment) {
        if (attachment == null || attachment.isEmpty()) {
            return;
        }
        if (attachment.getSize() > MAX_COMMENT_ATTACHMENT_BYTES) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "TASK_COMMENT_ATTACHMENT_TOO_LARGE",
                    "Attachment must be 10 MB or smaller"
            );
        }

        try {
            comment.setAttachmentFileName(cleanFileName(attachment.getOriginalFilename()));
            comment.setAttachmentContentType(attachment.getContentType());
            comment.setAttachmentSize(attachment.getSize());
            comment.setAttachmentData(attachment.getBytes());
        } catch (IOException exception) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "TASK_COMMENT_ATTACHMENT_INVALID",
                    "Attachment could not be read"
            );
        }
    }

    private String cleanFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "attachment";
        }
        String cleaned = fileName.replace("\\", "/");
        int lastSlash = cleaned.lastIndexOf('/');
        return cleaned.substring(lastSlash + 1);
    }

    /**
     * Resolves an optional {@code sprintId} to a sprint visible to {@code userId}, returning null when unassigned.
     */
    private Sprint resolveSprint(UUID sprintId, UUID userId) {
        if (sprintId == null) {
            return null;
        }
        return sprintRepository.findAccessibleByIdAndUserId(sprintId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));
    }

    /**
     * Resolves an optional assignee to any active user.
     */
    private User resolveAssignedTo(UUID assignedToId) {
        if (assignedToId == null) {
            return null;
        }
        return getUser(assignedToId);
    }

    /**
     * Resolves an optional reviewer, requiring sprint reviewers to be members of the same sprint.
     */
    private User resolveReviewer(UUID reviewerId, Sprint sprint) {
        if (reviewerId == null) {
            return null;
        }
        User reviewer = getUser(reviewerId);
        if (sprint == null) {
            return reviewer;
        }

        boolean isSprintMember = sprint.getUser().getId().equals(reviewerId)
                || sprint.getParticipants().stream().anyMatch(participant -> participant.getId().equals(reviewerId));
        if (!isSprintMember) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TASK_REVIEWER",
                    "Task reviewer must belong to the same sprint"
            );
        }
        return reviewer;
    }

    /**
     * Validates the optional developer-assigned story point estimate.
     */
    private Integer validateStoryPoints(Integer storyPoints) {
        if (storyPoints != null && storyPoints < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_STORY_POINTS", "Story points cannot be negative");
        }
        return storyPoints;
    }

    /**
     * Validates optional developer-estimated or logged implementation hours.
     */
    private BigDecimal validateEstimatedHours(BigDecimal estimatedHours) {
        if (estimatedHours != null && estimatedHours.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_ESTIMATED_HOURS", "Estimated hours cannot be negative");
        }
        return estimatedHours;
    }

    /**
     * Rejects a non-null {@code dueDate} when it is before the current local date.
     */
    private void validateDueDate(LocalDate dueDate) {
        if (dueDate != null && dueDate.isBefore(LocalDate.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DUE_DATE", "Due date cannot be in the past");
        }
    }

    private void validateDeveloperCreateRequest(TaskCreateRequest request, UUID userId, UserRole role) {
        if (role.canSetTaskMetadata()) {
            return;
        }
        if (request.assignedToId() != null && !request.assignedToId().equals(userId)) {
            throw new ForbiddenException("Developers can only assign tasks to themselves");
        }
    }

    private void validateTaskUpdatePermissions(TaskUpdateRequest request, Task task, UUID userId, UserRole role) {
        if (role.canSetTaskMetadata()) {
            return;
        }
        if (request.sprintId() != null) {
            UUID currentSprintId = task.getSprint() == null ? null : task.getSprint().getId();
            if (!request.sprintId().equals(currentSprintId)) {
                throw new ForbiddenException("Developers cannot move tasks between sprints");
            }
        }
        if (request.assignedToId() != null && !request.assignedToId().equals(userId)) {
            throw new ForbiddenException("Developers can only assign tasks to themselves");
        }
    }

    private void ensureCanUpdateTask(Task task, UUID userId, UserRole role, TaskUpdateRequest request) {
        if (role.canEditAnyVisibleTask() || task.getUser().getId().equals(userId)) {
            return;
        }
        if (request.title() == null
                && request.description() == null
                && request.dueDate() == null
                && request.sprintId() == null
                && request.assignedToId() == null
                && request.comments() == null) {
            return;
        }
        throw new ForbiddenException("Developers can only edit status and task metadata on visible tasks they did not create");
    }

    /**
     * Builds the JPA specification for task search using owner id plus optional status, priority, assignee, and due-date bounds.
     */
    private Specification<Task> buildFilter(
            UUID userId,
            TaskStatus status,
            TaskPriority priority,
            UUID assignedToId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();
            var sprintJoin = root.join("sprint", JoinType.LEFT);
            var participantJoin = sprintJoin.join("participants", JoinType.LEFT);
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.equal(root.get("user").get("id"), userId),
                    criteriaBuilder.equal(sprintJoin.get("user").get("id"), userId),
                    criteriaBuilder.equal(participantJoin.get("id"), userId)
            ));

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }
            if (assignedToId != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignedTo").get("id"), assignedToId));
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
