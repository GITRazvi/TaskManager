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
import com.taskmanager.entity.enums.ProjectRole;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectMemberRepository;
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
    private final ProjectMemberRepository projectMemberRepository;

    /**
     * Creates the task service with repositories used for task persistence, user lookup, and sprint ownership checks.
     */
    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            SprintRepository sprintRepository,
            TaskCommentRepository taskCommentRepository,
            TaskStatusHistoryRepository taskStatusHistoryRepository,
            ProjectMemberRepository projectMemberRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.sprintRepository = sprintRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.taskStatusHistoryRepository = taskStatusHistoryRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    /**
     * Creates a task for {@code userId}, resolving optional sprint and assignee ids and defaulting status/priority.
     */
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request, UUID userId) {
        return createTask(request, userId, (ProjectRole) null);
    }

    /**
     * Legacy overload for direct callers that still pass a global role. HTTP paths use project roles.
     */
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request, UUID userId, UserRole userRole) {
        return createTask(request, userId, mapLegacyRole(userRole));
    }

    private TaskResponse createTask(TaskCreateRequest request, UUID userId, ProjectRole forcedRole) {
        validateDueDate(request.dueDate());
        if (forcedRole != null) {
            ensureCanCreateTasks(forcedRole);
        }
        User user = getUser(userId);
        Sprint sprint = resolveSprint(request.sprintId(), userId);
        ProjectRole role = forcedRole == null ? roleForSprintOrPersonalBacklog(sprint, userId) : forcedRole;
        ensureCanCreateTasks(role);
        validateCreateRequest(request, userId, role);

        Task task = new Task();
        task.setUser(user);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(request.dueDate());
        task.setSprint(sprint);
        task.setAssignedTo(resolveAssignedTo(request.assignedToId(), sprint));
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
    public TaskResponse updateTask(UUID taskId, UUID userId, TaskUpdateRequest request) {
        return updateTask(taskId, userId, request, null);
    }

    /**
     * Legacy overload for direct callers that still pass a global role. HTTP paths use project roles.
     */
    @Transactional
    public TaskResponse updateTask(UUID taskId, UUID userId, UserRole userRole, TaskUpdateRequest request) {
        return updateTask(taskId, userId, request, mapLegacyRole(userRole));
    }

    private TaskResponse updateTask(UUID taskId, UUID userId, TaskUpdateRequest request, ProjectRole forcedRole) {
        validateDueDate(request.dueDate());
        Task task = getVisibleTask(taskId, userId);
        ProjectRole role = forcedRole == null ? roleForTask(task, userId) : forcedRole;
        ensureCanModifyTasks(role);
        ensureCanUpdateTask(task, userId, role, request);
        validateTaskUpdatePermissions(request, task, userId, role);

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
            task.setAssignedTo(resolveAssignedTo(request.assignedToId(), sprintForReviewer));
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
    public void deleteTask(UUID taskId, UUID userId) {
        deleteTask(taskId, userId, (ProjectRole) null);
    }

    /**
     * Legacy overload for direct callers that still pass a global role. HTTP paths use project roles.
     */
    @Transactional
    public void deleteTask(UUID taskId, UUID userId, UserRole userRole) {
        deleteTask(taskId, userId, mapLegacyRole(userRole));
    }

    private void deleteTask(UUID taskId, UUID userId, ProjectRole forcedRole) {
        Task task = getVisibleTask(taskId, userId);
        ProjectRole role = forcedRole == null ? roleForTask(task, userId) : forcedRole;
        ensureCanModifyTasks(role);
        if (!role.canEditAnyVisibleTask() && !task.getUser().getId().equals(userId)) {
            throw new ForbiddenException("This role can only delete tasks they created");
        }
        taskRepository.delete(task);
    }

    /**
     * Updates a visible task's workflow {@code status} and returns the refreshed response.
     */
    @Transactional
    public TaskResponse updateStatus(UUID taskId, UUID userId, TaskStatus status) {
        return updateStatus(taskId, userId, status, null);
    }

    /**
     * Legacy overload for direct callers that still pass a global role. HTTP paths use project roles.
     */
    @Transactional
    public TaskResponse updateStatus(UUID taskId, UUID userId, UserRole userRole, TaskStatus status) {
        return updateStatus(taskId, userId, status, mapLegacyRole(userRole));
    }

    private TaskResponse updateStatus(UUID taskId, UUID userId, TaskStatus status, ProjectRole forcedRole) {
        if (forcedRole != null) {
            ensureCanTransitionTasks(forcedRole);
        }
        Task task = getVisibleTask(taskId, userId);
        ProjectRole role = forcedRole == null ? roleForTask(task, userId) : forcedRole;
        ensureCanTransitionTasks(role);
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
    private User resolveAssignedTo(UUID assignedToId, Sprint sprint) {
        if (assignedToId == null) {
            return null;
        }
        User assignee = getUser(assignedToId);
        if (sprint != null && !projectMemberRepository.existsByProjectIdAndUserId(sprint.getProject().getId(), assignedToId)) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TASK_ASSIGNEE",
                    "Task assignee must belong to the same project"
            );
        }
        return assignee;
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

        boolean isProjectMember = projectMemberRepository.existsByProjectIdAndUserId(sprint.getProject().getId(), reviewerId);
        if (!isProjectMember) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TASK_REVIEWER",
                    "Task reviewer must belong to the same project"
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

    private ProjectRole roleForTask(Task task, UUID userId) {
        Sprint sprint = task.getSprint();
        if (sprint == null || sprint.getProject() == null) {
            if (task.getUser().getId().equals(userId)) {
                return ProjectRole.DEVELOPER;
            }
            throw new ForbiddenException("You do not have a role for this task");
        }
        return projectMemberRepository.findRoleByProjectIdAndUserId(sprint.getProject().getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have a role in this project"));
    }

    private ProjectRole roleForSprintOrPersonalBacklog(Sprint sprint, UUID userId) {
        if (sprint == null || sprint.getProject() == null) {
            return ProjectRole.DEVELOPER;
        }
        return projectMemberRepository.findRoleByProjectIdAndUserId(sprint.getProject().getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have a role in this project"));
    }

    private ProjectRole mapLegacyRole(UserRole role) {
        if (role == null) {
            return null;
        }
        return switch (role) {
            case ADMIN, PROJECT_MANAGER -> ProjectRole.PROJECT_MANAGER;
            case DEVELOPER -> ProjectRole.DEVELOPER;
            case QA_TESTER -> ProjectRole.QA_TESTER;
            case PRODUCT_OWNER -> ProjectRole.PRODUCT_OWNER;
            case SCRUM_MASTER -> ProjectRole.SCRUM_MASTER;
            case VIEWER -> ProjectRole.VIEWER;
        };
    }

    private void validateCreateRequest(TaskCreateRequest request, UUID userId, ProjectRole role) {
        if (request.assignedToId() != null && !role.canAssignTasks() && !request.assignedToId().equals(userId)) {
            throw new ForbiddenException("This role can only assign tasks to themselves");
        }
    }

    private void validateTaskUpdatePermissions(TaskUpdateRequest request, Task task, UUID userId, ProjectRole role) {
        if (request.sprintId() != null) {
            UUID currentSprintId = task.getSprint() == null ? null : task.getSprint().getId();
            if (!request.sprintId().equals(currentSprintId) && !role.canManageSprints()) {
                throw new ForbiddenException("This role cannot move tasks between sprints");
            }
        }
        if (request.assignedToId() != null && !role.canAssignTasks() && !request.assignedToId().equals(userId)) {
            throw new ForbiddenException("This role can only assign tasks to themselves");
        }
    }

    private void ensureCanUpdateTask(Task task, UUID userId, ProjectRole role, TaskUpdateRequest request) {
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
        throw new ForbiddenException("This role can only edit status and task metadata on visible tasks they did not create");
    }

    private void ensureCanCreateTasks(ProjectRole role) {
        if (!role.canCreateTasks()) {
            throw new ForbiddenException("Viewers cannot create tasks");
        }
    }

    private void ensureCanModifyTasks(ProjectRole role) {
        if (role == ProjectRole.VIEWER) {
            throw new ForbiddenException("Viewers cannot modify tasks");
        }
    }

    private void ensureCanTransitionTasks(ProjectRole role) {
        if (!role.canTransitionTasks()) {
            throw new ForbiddenException("Viewers cannot transition task status");
        }
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
            var projectJoin = sprintJoin.join("project", JoinType.LEFT);
            var projectMemberJoin = projectJoin.join("members", JoinType.LEFT);
            var participantJoin = sprintJoin.join("participants", JoinType.LEFT);
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.equal(root.get("user").get("id"), userId),
                    criteriaBuilder.equal(projectMemberJoin.get("user").get("id"), userId),
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
