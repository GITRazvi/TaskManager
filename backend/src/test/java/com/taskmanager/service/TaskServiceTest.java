// File responsibility: Tests task creation defaults, due-date validation, title validation, and status updates.
package com.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskmanager.dto.TaskCreateRequest;
import com.taskmanager.dto.TaskUpdateRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.repository.SprintRepository;
import com.taskmanager.repository.TaskCommentRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TaskStatusHistoryRepository;
import com.taskmanager.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private TaskCommentRepository taskCommentRepository;

    @Mock
    private TaskStatusHistoryRepository taskStatusHistoryRepository;

    private TaskService taskService;

    /**
     * Creates the TaskService under test with mocked task, user, and sprint repositories.
     */
    @BeforeEach
    void setUp() {
        taskService = new TaskService(
                taskRepository,
                userRepository,
                sprintRepository,
                taskCommentRepository,
                taskStatusHistoryRepository
        );
    }

    /**
     * Verifies task creation defaults priority/status and resolves sprint and assignee using request ids.
     */
    @Test
    void createTaskDefaultsPriorityAndStatusAndAssignsAnotherActiveUser() {
        UUID userId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User user = activeUser(userId);
        User assignee = activeUser(assigneeId, "mira", "mira@example.com");
        Sprint sprint = sprint(sprintId, user);
        LocalDate dueDate = LocalDate.now().plusDays(3);
        TaskCreateRequest request = new TaskCreateRequest(
                "Write tests",
                "Cover service behavior",
                null,
                dueDate,
                sprintId,
                assigneeId,
                null,
                3,
                new BigDecimal("6.5"),
                "Ready for review"
        );
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findById(assigneeId)).thenReturn(Optional.of(assignee));
        when(sprintRepository.findAccessibleByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(UUID.randomUUID());
            return task;
        });
        when(taskStatusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = taskService.createTask(request, userId, UserRole.PROJECT_MANAGER);

        assertThat(response.title()).isEqualTo("Write tests");
        assertThat(response.status()).isEqualTo(TaskStatus.TODO);
        assertThat(response.priority()).isEqualTo(TaskPriority.MEDIUM);
        assertThat(response.sprintId()).isEqualTo(sprintId);
        assertThat(response.assignedToId()).isEqualTo(assigneeId);
        assertThat(response.storyPoints()).isEqualTo(3);
        assertThat(response.estimatedHours()).isEqualByComparingTo("6.5");
        assertThat(response.comments()).extracting("content").containsExactly("Ready for review");
        assertThat(response.statusHistory()).hasSize(1);
        assertThat(response.statusHistory().get(0).fromStatus()).isNull();
        assertThat(response.statusHistory().get(0).toStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(response.statusHistory().get(0).changedById()).isEqualTo(userId);
        assertThat(response.dueDate()).isEqualTo(dueDate);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        Task savedTask = taskCaptor.getValue();
        assertThat(savedTask.getUser()).isSameAs(user);
        assertThat(savedTask.getSprint()).isSameAs(sprint);
        assertThat(savedTask.getAssignedTo()).isSameAs(assignee);
        assertThat(savedTask.getStoryPoints()).isEqualTo(3);
        assertThat(savedTask.getEstimatedHours()).isEqualByComparingTo("6.5");
        assertThat(savedTask.getComments()).extracting("content").containsExactly("Ready for review");
        verify(taskStatusHistoryRepository).save(any());
    }

    /**
     * Verifies a sprint task can use another sprint member as reviewer.
     */
    @Test
    void createTaskAllowsReviewerFromSameSprint() {
        UUID userId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User owner = activeUser(userId);
        User reviewer = activeUser(reviewerId, "sam", "sam@example.com");
        Sprint sprint = sprint(sprintId, owner);
        sprint.getParticipants().add(reviewer);
        TaskCreateRequest request = new TaskCreateRequest(
                "Reviewable task",
                null,
                TaskPriority.HIGH,
                null,
                sprintId,
                null,
                reviewerId,
                5,
                new BigDecimal("4"),
                null
        );
        when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));
        when(sprintRepository.findAccessibleByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(UUID.randomUUID());
            return task;
        });
        when(taskStatusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = taskService.createTask(request, userId, UserRole.PROJECT_MANAGER);

        assertThat(response.reviewerId()).isEqualTo(reviewerId);
        assertThat(response.storyPoints()).isEqualTo(5);
        assertThat(response.estimatedHours()).isEqualByComparingTo("4");
    }

    /**
     * Verifies sprint task reviewers must belong to the same sprint.
     */
    @Test
    void createTaskRejectsReviewerOutsideSprint() {
        UUID userId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User owner = activeUser(userId);
        User reviewer = activeUser(reviewerId, "sam", "sam@example.com");
        Sprint sprint = sprint(sprintId, owner);
        TaskCreateRequest request = new TaskCreateRequest(
                "Reviewable task",
                null,
                TaskPriority.HIGH,
                null,
                sprintId,
                null,
                reviewerId,
                null,
                null,
                null
        );
        when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));
        when(sprintRepository.findAccessibleByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));

        assertThatThrownBy(() -> taskService.createTask(request, userId, UserRole.PROJECT_MANAGER))
                .isInstanceOf(AppException.class)
                .hasMessage("Task reviewer must belong to the same sprint")
                .extracting("errorCode")
                .isEqualTo("INVALID_TASK_REVIEWER");

        verify(taskRepository, never()).save(any(Task.class));
    }

    /**
     * Verifies a past due date is rejected before user lookup or task persistence occurs.
     */
    @Test
    void createTaskRejectsPastDueDateBeforeRepositoryLookup() {
        UUID userId = UUID.randomUUID();
        TaskCreateRequest request = new TaskCreateRequest(
                "Expired task",
                null,
                TaskPriority.HIGH,
                LocalDate.now().minusDays(1),
                null,
                null,
                null,
                null,
                null,
                null
        );

        assertThatThrownBy(() -> taskService.createTask(request, userId, UserRole.PROJECT_MANAGER))
                .isInstanceOf(AppException.class)
                .hasMessage("Due date cannot be in the past")
                .extracting("errorCode")
                .isEqualTo("INVALID_DUE_DATE");

        verify(userRepository, never()).findById(any(UUID.class));
        verify(taskRepository, never()).save(any(Task.class));
    }

    /**
     * Verifies task updates reject a non-null title that is blank after trimming.
     */
    @Test
    void updateTaskRejectsBlankTitle() {
        UUID userId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task(taskId, activeUser(userId))));
        TaskUpdateRequest request = new TaskUpdateRequest("   ", null, null, null, null, null, null, null, null, null, null);

        assertThatThrownBy(() -> taskService.updateTask(taskId, userId, UserRole.PROJECT_MANAGER, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Task title cannot be blank")
                .extracting("errorCode")
                .isEqualTo("INVALID_TASK_TITLE");
    }

    /**
     * Verifies visible sprint tasks can save estimates and comments even when the current user is not the task owner.
     */
    @Test
    void updateTaskSavesVisibleSprintTaskDetails() {
        UUID userId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        User owner = activeUser(ownerId, "owner", "owner@example.com");
        User participant = activeUser(userId, "participant", "participant@example.com");
        Sprint sprint = sprint(UUID.randomUUID(), owner);
        sprint.getParticipants().add(participant);
        Task task = task(taskId, owner);
        task.setSprint(sprint);
        TaskUpdateRequest request = new TaskUpdateRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                8,
                new BigDecimal("12.25"),
                "Implementation notes"
        );
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(userRepository.findById(userId)).thenReturn(Optional.of(participant));

        var response = taskService.updateTask(taskId, userId, UserRole.PROJECT_MANAGER, request);

        assertThat(task.getStoryPoints()).isEqualTo(8);
        assertThat(task.getEstimatedHours()).isEqualByComparingTo("12.25");
        assertThat(task.getComments()).extracting("content").containsExactly("Implementation notes");
        assertThat(response.storyPoints()).isEqualTo(8);
        assertThat(response.estimatedHours()).isEqualByComparingTo("12.25");
        assertThat(response.comments()).extracting("content").containsExactly("Implementation notes");
    }

    /**
     * Verifies developers can update metadata on visible sprint tasks created by another user.
     */
    @Test
    void updateTaskAllowsDeveloperToChangeVisibleTaskMetadata() {
        UUID userId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        User owner = activeUser(ownerId, "owner", "owner@example.com");
        User developer = activeUser(userId, "developer", "developer@example.com");
        User reviewer = activeUser(reviewerId, "reviewer", "reviewer@example.com");
        Sprint sprint = sprint(UUID.randomUUID(), owner);
        sprint.getParticipants().add(developer);
        sprint.getParticipants().add(reviewer);
        Task task = task(taskId, owner);
        task.setSprint(sprint);
        TaskUpdateRequest request = new TaskUpdateRequest(
                null,
                null,
                null,
                TaskPriority.HIGH,
                null,
                null,
                null,
                reviewerId,
                8,
                new BigDecimal("12.25"),
                null
        );
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));

        var response = taskService.updateTask(taskId, userId, UserRole.DEVELOPER, request);

        assertThat(task.getPriority()).isEqualTo(TaskPriority.HIGH);
        assertThat(task.getReviewer()).isSameAs(reviewer);
        assertThat(task.getStoryPoints()).isEqualTo(8);
        assertThat(task.getEstimatedHours()).isEqualByComparingTo("12.25");
        assertThat(response.priority()).isEqualTo(TaskPriority.HIGH);
        assertThat(response.reviewerId()).isEqualTo(reviewerId);
        assertThat(response.storyPoints()).isEqualTo(8);
        assertThat(response.estimatedHours()).isEqualByComparingTo("12.25");
    }

    /**
     * Verifies comments can persist an attached file and expose its metadata in the response.
     */
    @Test
    void addCommentStoresAttachmentMetadata() {
        UUID userId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        User user = activeUser(userId);
        Task task = task(taskId, user);
        MockMultipartFile attachment = new MockMultipartFile(
                "attachment",
                "bug.png",
                "image/png",
                new byte[] { 1, 2, 3 }
        );
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(taskCommentRepository.save(any())).thenAnswer(invocation -> {
            var comment = invocation.getArgument(0, com.taskmanager.entity.TaskComment.class);
            comment.setId(UUID.randomUUID());
            return comment;
        });

        var response = taskService.addComment(taskId, userId, "Screenshot attached", attachment);

        assertThat(response.content()).isEqualTo("Screenshot attached");
        assertThat(response.attachmentFileName()).isEqualTo("bug.png");
        assertThat(response.attachmentContentType()).isEqualTo("image/png");
        assertThat(response.attachmentSize()).isEqualTo(3);
        assertThat(response.attachmentUrl()).contains("/tasks/" + taskId + "/comments/");

        ArgumentCaptor<com.taskmanager.entity.TaskComment> commentCaptor =
                ArgumentCaptor.forClass(com.taskmanager.entity.TaskComment.class);
        verify(taskCommentRepository).save(commentCaptor.capture());
        assertThat(commentCaptor.getValue().getAttachmentData()).containsExactly(1, 2, 3);
    }

    /**
     * Verifies updating status mutates a visible task and returns the new status in the response.
     */
    @Test
    void updateStatusChangesVisibleTask() {
        UUID userId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, activeUser(userId));
        task.setStatus(TaskStatus.TODO);
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(userRepository.findById(userId)).thenReturn(Optional.of(task.getUser()));
        when(taskStatusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = taskService.updateStatus(taskId, userId, TaskStatus.REVIEW);

        assertThat(task.getStatus()).isEqualTo(TaskStatus.REVIEW);
        assertThat(response.status()).isEqualTo(TaskStatus.REVIEW);
        assertThat(response.statusHistory()).hasSize(1);
        assertThat(response.statusHistory().get(0).fromStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(response.statusHistory().get(0).toStatus()).isEqualTo(TaskStatus.REVIEW);
        assertThat(response.statusHistory().get(0).changedById()).isEqualTo(userId);
    }

    /**
     * Verifies dashboard task statistics aggregate visible tasks separately for each project.
     */
    @Test
    void getTaskStatsAggregatesVisibleTasksByProject() {
        UUID userId = UUID.randomUUID();
        User user = activeUser(userId);
        Project firstProject = project(UUID.randomUUID(), user, "Platform");
        Project secondProject = project(UUID.randomUUID(), user, "Mobile");
        Sprint firstSprint = sprint(UUID.randomUUID(), user);
        firstSprint.setProject(firstProject);
        Sprint secondSprint = sprint(UUID.randomUUID(), user);
        secondSprint.setProject(secondProject);
        Task done = task(UUID.randomUUID(), user);
        done.setSprint(firstSprint);
        done.setStatus(TaskStatus.DONE);
        done.setPriority(TaskPriority.HIGH);
        done.setStoryPoints(5);
        done.setDueDate(LocalDate.now().minusDays(2));
        Task overdue = task(UUID.randomUUID(), user);
        overdue.setSprint(firstSprint);
        overdue.setStatus(TaskStatus.IN_PROGRESS);
        overdue.setPriority(TaskPriority.CRITICAL);
        overdue.setStoryPoints(3);
        overdue.setDueDate(LocalDate.now().minusDays(1));
        Task planned = task(UUID.randomUUID(), user);
        planned.setSprint(secondSprint);
        planned.setStatus(TaskStatus.TODO);
        planned.setPriority(TaskPriority.LOW);
        planned.setStoryPoints(2);
        planned.setDueDate(LocalDate.now().plusDays(1));
        when(sprintRepository.findAllAccessibleByUserId(userId))
                .thenReturn(java.util.List.of(firstSprint, secondSprint));
        when(taskRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(java.util.List.of(done, overdue, planned));

        var stats = taskService.getTaskStats(userId);
        assertThat(stats).hasSize(2);
        var platformStats = stats.get(0);
        var mobileStats = stats.get(1);

        assertThat(platformStats.projectId()).isEqualTo(firstProject.getId());
        assertThat(platformStats.projectName()).isEqualTo("Platform");
        assertThat(platformStats.totalTasks()).isEqualTo(2);
        assertThat(platformStats.completedTasks()).isEqualTo(1);
        assertThat(platformStats.completionPercentage()).isEqualTo(50.0);
        assertThat(platformStats.completedStoryPoints()).isEqualTo(5);
        assertThat(platformStats.remainingStoryPoints()).isEqualTo(3);
        assertThat(platformStats.totalStoryPoints()).isEqualTo(8);
        assertThat(platformStats.overdueTasks()).isEqualTo(1);
        assertThat(platformStats.tasksByStatus())
                .containsEntry(TaskStatus.DONE, 1L)
                .containsEntry(TaskStatus.IN_PROGRESS, 1L);
        assertThat(platformStats.tasksByPriority())
                .containsEntry(TaskPriority.HIGH, 1L)
                .containsEntry(TaskPriority.CRITICAL, 1L);
        assertThat(mobileStats.projectId()).isEqualTo(secondProject.getId());
        assertThat(mobileStats.projectName()).isEqualTo("Mobile");
        assertThat(mobileStats.totalTasks()).isEqualTo(1);
        assertThat(mobileStats.completedTasks()).isZero();
        assertThat(mobileStats.remainingStoryPoints()).isEqualTo(2);
        assertThat(mobileStats.overdueTasks()).isZero();
        assertThat(mobileStats.tasksByStatus()).containsEntry(TaskStatus.TODO, 1L);
    }

    /**
     * Verifies developers cannot create tasks assigned to another user.
     */
    @Test
    void createTaskRejectsDeveloperAssigningAnotherUser() {
        UUID userId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        User user = activeUser(userId);
        TaskCreateRequest request = new TaskCreateRequest(
                "Assign elsewhere",
                null,
                null,
                null,
                null,
                assigneeId,
                null,
                null,
                null,
                null
        );
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> taskService.createTask(request, userId, UserRole.DEVELOPER))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Developers can only assign tasks to themselves");

        verify(taskRepository, never()).save(any(Task.class));
    }

    /**
     * Verifies developers cannot edit visible tasks created by another user.
     */
    @Test
    void updateTaskRejectsDeveloperEditingAnotherUsersTask() {
        UUID userId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, activeUser(ownerId, "owner", "owner@example.com"));
        TaskUpdateRequest request = new TaskUpdateRequest(
                null,
                "Updated description",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.updateTask(taskId, userId, UserRole.DEVELOPER, request))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Developers can only edit status and task metadata on visible tasks they did not create");
    }

    /**
     * Verifies completed tasks can move back to todo when work needs to be reopened.
     */
    @Test
    void updateStatusAllowsMovingDoneTaskBackToTodo() {
        UUID userId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, activeUser(userId));
        task.setStatus(TaskStatus.DONE);
        when(taskRepository.findVisibleByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));
        when(userRepository.findById(userId)).thenReturn(Optional.of(task.getUser()));
        when(taskStatusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = taskService.updateStatus(taskId, userId, TaskStatus.TODO);

        assertThat(task.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(response.status()).isEqualTo(TaskStatus.TODO);
    }

    /**
     * Builds an active User fixture with the supplied {@code userId}.
     */
    private static User activeUser(UUID userId) {
        return activeUser(userId, "alex", "alex@example.com");
    }

    /**
     * Builds an active User fixture with identity fields.
     */
    private static User activeUser(UUID userId, String username, String email) {
        User user = new User();
        user.setId(userId);
        user.setUsername(username);
        user.setEmail(email);
        user.setActive(true);
        return user;
    }

    /**
     * Builds a Sprint fixture owned by {@code user} and identified by {@code sprintId}.
     */
    private static Sprint sprint(UUID sprintId, User user) {
        Sprint sprint = new Sprint();
        sprint.setId(sprintId);
        sprint.setUser(user);
        sprint.setName("Sprint 1");
        sprint.setStartDate(LocalDate.now());
        sprint.setEndDate(LocalDate.now().plusWeeks(2));
        return sprint;
    }

    /**
     * Builds a Project fixture owned by {@code user}.
     */
    private static Project project(UUID projectId, User user, String name) {
        Project project = new Project();
        project.setId(projectId);
        project.setUser(user);
        project.setName(name);
        return project;
    }

    /**
     * Builds a Task fixture owned by {@code user} and identified by {@code taskId}.
     */
    private static Task task(UUID taskId, User user) {
        Task task = new Task();
        task.setId(taskId);
        task.setUser(user);
        task.setTitle("Existing task");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.MEDIUM);
        return task;
    }
}
