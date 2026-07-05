// File responsibility: Tests sprint creation validation, statistics calculation, and board grouping behavior.
package com.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskmanager.dto.SprintCreateRequest;
import com.taskmanager.dto.SprintUpdateRequest;
import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.SprintStatus;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.SprintRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SprintServiceTest {
    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    private SprintService sprintService;

    /**
     * Creates the SprintService under test with mocked sprint, task, and user repositories.
     */
    @BeforeEach
    void setUp() {
        sprintService = new SprintService(sprintRepository, taskRepository, userRepository);
    }

    /**
     * Verifies new sprints are saved for the request user with PLANNING status and the request date range.
     */
    @Test
    void createSprintSetsPlanningStatus() {
        UUID userId = UUID.randomUUID();
        User user = activeUser(userId);
        LocalDate startDate = LocalDate.now().plusDays(1);
        LocalDate endDate = startDate.plusWeeks(2);
        SprintCreateRequest request = new SprintCreateRequest("Sprint 1", "Initial sprint", startDate, endDate, List.of());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(invocation -> {
            Sprint sprint = invocation.getArgument(0);
            sprint.setId(UUID.randomUUID());
            return sprint;
        });

        var response = sprintService.createSprint(request, userId);

        assertThat(response.name()).isEqualTo("Sprint 1");
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.status()).isEqualTo(SprintStatus.PLANNING);
        assertThat(response.startDate()).isEqualTo(startDate);
        assertThat(response.endDate()).isEqualTo(endDate);
        assertThat(response.participants()).extracting("id").containsExactly(userId);

        ArgumentCaptor<Sprint> sprintCaptor = ArgumentCaptor.forClass(Sprint.class);
        verify(sprintRepository).save(sprintCaptor.capture());
        Sprint savedSprint = sprintCaptor.getValue();
        assertThat(savedSprint.getUser()).isSameAs(user);
        assertThat(savedSprint.getStatus()).isEqualTo(SprintStatus.PLANNING);
        assertThat(savedSprint.getParticipants()).containsExactly(user);
    }

    /**
     * Verifies sprint creation resolves usernames and emails to active participants.
     */
    @Test
    void createSprintAddsParticipantsByUsernameOrEmail() {
        UUID userId = UUID.randomUUID();
        UUID miraId = UUID.randomUUID();
        UUID noahId = UUID.randomUUID();
        User user = activeUser(userId);
        User mira = activeUser(miraId, "mira", "mira@example.com");
        User noah = activeUser(noahId, "noah", "noah@example.com");
        LocalDate startDate = LocalDate.now().plusDays(1);
        LocalDate endDate = startDate.plusWeeks(2);
        SprintCreateRequest request = new SprintCreateRequest(
                "Sprint 1",
                "Initial sprint",
                startDate,
                endDate,
                List.of("mira", "noah@example.com")
        );
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findActiveByUsernameOrEmail("mira")).thenReturn(Optional.of(mira));
        when(userRepository.findActiveByUsernameOrEmail("noah@example.com")).thenReturn(Optional.of(noah));
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(invocation -> {
            Sprint sprint = invocation.getArgument(0);
            sprint.setId(UUID.randomUUID());
            return sprint;
        });

        var response = sprintService.createSprint(request, userId);

        assertThat(response.participants()).extracting("id").containsExactly(userId, miraId, noahId);
    }

    /**
     * Verifies sprint owners can replace the sprint participant list while the owner remains a participant.
     */
    @Test
    void updateSprintReplacesParticipants() {
        UUID userId = UUID.randomUUID();
        UUID miraId = UUID.randomUUID();
        UUID noahId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User user = activeUser(userId);
        User mira = activeUser(miraId, "mira", "mira@example.com");
        User noah = activeUser(noahId, "noah", "noah@example.com");
        Sprint sprint = sprint(sprintId, user);
        sprint.setParticipants(new LinkedHashSet<>(List.of(user, mira)));
        SprintUpdateRequest request = new SprintUpdateRequest(
                null,
                null,
                null,
                null,
                null,
                List.of("noah@example.com")
        );
        when(sprintRepository.findByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));
        when(userRepository.findActiveByUsernameOrEmail("noah@example.com")).thenReturn(Optional.of(noah));

        var response = sprintService.updateSprint(sprintId, userId, request);

        assertThat(sprint.getParticipants()).containsExactly(user, noah);
        assertThat(response.participants()).extracting("id").containsExactly(userId, noahId);
    }

    /**
     * Verifies sprint deletion only deletes a sprint owned by the requesting user.
     */
    @Test
    void deleteSprintDeletesOwnedSprint() {
        UUID userId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        Sprint sprint = sprint(sprintId, activeUser(userId));
        when(sprintRepository.findByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));

        sprintService.deleteSprint(sprintId, userId);

        verify(sprintRepository).delete(sprint);
    }

    /**
     * Verifies an invalid end date is rejected before the service looks up the user or saves a sprint.
     */
    @Test
    void createSprintRejectsEndDateOnOrBeforeStartDate() {
        UUID userId = UUID.randomUUID();
        LocalDate startDate = LocalDate.now().plusDays(1);
        SprintCreateRequest request = new SprintCreateRequest("Sprint 1", null, startDate, startDate, List.of());

        assertThatThrownBy(() -> sprintService.createSprint(request, userId))
                .isInstanceOf(AppException.class)
                .hasMessage("Sprint end date must be after start date")
                .extracting("errorCode")
                .isEqualTo("INVALID_SPRINT_DATES");

        verify(userRepository, never()).findById(any(UUID.class));
        verify(sprintRepository, never()).save(any(Sprint.class));
    }

    /**
     * Verifies sprint statistics derive totals, velocity, completion percentage, and priority counts from tasks.
     */
    @Test
    void getSprintStatsCalculatesCompletionAndPriorityCounts() {
        UUID userId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User user = activeUser(userId);
        Sprint sprint = sprint(sprintId, user);
        when(sprintRepository.findAccessibleByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));
        when(taskRepository.findAllBySprintId(sprintId)).thenReturn(List.of(
                task(UUID.randomUUID(), user, sprint, TaskStatus.DONE, TaskPriority.HIGH),
                task(UUID.randomUUID(), user, sprint, TaskStatus.IN_PROGRESS, TaskPriority.HIGH),
                task(UUID.randomUUID(), user, sprint, TaskStatus.TODO, TaskPriority.LOW)
        ));

        var stats = sprintService.getSprintStats(sprintId, userId);

        assertThat(stats.sprintId()).isEqualTo(sprintId);
        assertThat(stats.totalTasks()).isEqualTo(3);
        assertThat(stats.completedTasks()).isEqualTo(1);
        assertThat(stats.velocity()).isEqualTo(1);
        assertThat(stats.completionPercentage()).isEqualTo(100.0 / 3.0);
        assertThat(stats.tasksByPriority())
                .containsEntry(TaskPriority.HIGH, 2L)
                .containsEntry(TaskPriority.LOW, 1L);
    }

    /**
     * Verifies sprint board output groups tasks into todo, in-progress, and done lists by status.
     */
    @Test
    void getSprintBoardGroupsTasksByStatus() {
        UUID userId = UUID.randomUUID();
        UUID sprintId = UUID.randomUUID();
        User user = activeUser(userId);
        Sprint sprint = sprint(sprintId, user);
        when(sprintRepository.findAccessibleByIdAndUserId(sprintId, userId)).thenReturn(Optional.of(sprint));
        when(taskRepository.findAllBySprintId(sprintId)).thenReturn(List.of(
                task(UUID.randomUUID(), user, sprint, TaskStatus.TODO, TaskPriority.MEDIUM),
                task(UUID.randomUUID(), user, sprint, TaskStatus.IN_PROGRESS, TaskPriority.HIGH),
                task(UUID.randomUUID(), user, sprint, TaskStatus.DONE, TaskPriority.LOW)
        ));

        var board = sprintService.getSprintBoard(sprintId, userId);

        assertThat(board.sprintId()).isEqualTo(sprintId);
        assertThat(board.todo()).hasSize(1);
        assertThat(board.inProgress()).hasSize(1);
        assertThat(board.done()).hasSize(1);
        assertThat(board.todo().get(0).status()).isEqualTo(TaskStatus.TODO);
        assertThat(board.inProgress().get(0).status()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(board.done().get(0).status()).isEqualTo(TaskStatus.DONE);
    }

    /**
     * Builds an active User fixture with the supplied {@code userId}.
     */
    private static User activeUser(UUID userId) {
        return activeUser(userId, "alex", "alex@example.com");
    }

    /**
     * Builds an active User fixture with the supplied identity fields.
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
        sprint.setStatus(SprintStatus.PLANNING);
        return sprint;
    }

    /**
     * Builds a Task fixture linked to {@code user} and {@code sprint} with the supplied status and priority.
     */
    private static Task task(UUID taskId, User user, Sprint sprint, TaskStatus status, TaskPriority priority) {
        Task task = new Task();
        task.setId(taskId);
        task.setUser(user);
        task.setSprint(sprint);
        task.setTitle(status.name());
        task.setStatus(status);
        task.setPriority(priority);
        return task;
    }
}
