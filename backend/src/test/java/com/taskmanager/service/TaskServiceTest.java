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
import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.SprintRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SprintRepository sprintRepository;

    private TaskService taskService;

    /**
     * Creates the TaskService under test with mocked task, user, and sprint repositories.
     */
    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository, userRepository, sprintRepository);
    }

    /**
     * Verifies task creation defaults priority/status and resolves sprint and assignee using request ids.
     */
    @Test
    void createTaskDefaultsPriorityAndStatusAndAssignsCurrentUser() {
        UUID userId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User user = activeUser(userId);
        Sprint sprint = sprint(sprintId, user);
        LocalDate dueDate = LocalDate.now().plusDays(3);
        TaskCreateRequest request = new TaskCreateRequest(
                "Write tests",
                "Cover service behavior",
                null,
                dueDate,
                sprintId,
                userId
        );
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sprintRepository.findByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(UUID.randomUUID());
            return task;
        });

        var response = taskService.createTask(request, userId);

        assertThat(response.title()).isEqualTo("Write tests");
        assertThat(response.status()).isEqualTo(TaskStatus.TODO);
        assertThat(response.priority()).isEqualTo(TaskPriority.MEDIUM);
        assertThat(response.sprintId()).isEqualTo(sprintId);
        assertThat(response.assignedToId()).isEqualTo(userId);
        assertThat(response.dueDate()).isEqualTo(dueDate);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        Task savedTask = taskCaptor.getValue();
        assertThat(savedTask.getUser()).isSameAs(user);
        assertThat(savedTask.getSprint()).isSameAs(sprint);
        assertThat(savedTask.getAssignedTo()).isSameAs(user);
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
                null
        );

        assertThatThrownBy(() -> taskService.createTask(request, userId))
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
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task(taskId, activeUser(userId))));
        TaskUpdateRequest request = new TaskUpdateRequest("   ", null, null, null, null, null, null);

        assertThatThrownBy(() -> taskService.updateTask(taskId, userId, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Task title cannot be blank")
                .extracting("errorCode")
                .isEqualTo("INVALID_TASK_TITLE");
    }

    /**
     * Verifies updating status mutates the existing owned task and returns the new status in the response.
     */
    @Test
    void updateStatusChangesExistingTask() {
        UUID userId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        Task task = task(taskId, activeUser(userId));
        task.setStatus(TaskStatus.TODO);
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(task));

        var response = taskService.updateStatus(taskId, userId, TaskStatus.DONE);

        assertThat(task.getStatus()).isEqualTo(TaskStatus.DONE);
        assertThat(response.status()).isEqualTo(TaskStatus.DONE);
    }

    /**
     * Builds an active User fixture with the supplied {@code userId}.
     */
    private static User activeUser(UUID userId) {
        User user = new User();
        user.setId(userId);
        user.setUsername("alex");
        user.setEmail("alex@example.com");
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
