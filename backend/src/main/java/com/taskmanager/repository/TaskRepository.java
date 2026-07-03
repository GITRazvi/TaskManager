// File responsibility: Provides Spring Data queries and specifications support for task persistence and filtering.
package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {
    /**
     * Finds a paged list of tasks owned by {@code userId}.
     */
    Page<Task> findAllByUserId(UUID userId, Pageable pageable);

    /**
     * Finds a task by id only when it is owned by {@code userId}.
     */
    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Finds all tasks assigned to the sprint identified by {@code sprintId}.
     */
    List<Task> findAllBySprintId(UUID sprintId);

    /**
     * Finds sprint tasks matching a specific workflow {@code status}.
     */
    List<Task> findBySprintIdAndStatus(UUID sprintId, TaskStatus status);

    /**
     * Finds a paged list of user tasks matching the provided workflow {@code status}.
     */
    Page<Task> findAllByUserIdAndStatus(UUID userId, TaskStatus status, Pageable pageable);

    /**
     * Finds a paged list of user tasks matching the provided {@code priority}.
     */
    Page<Task> findAllByUserIdAndPriority(UUID userId, TaskPriority priority, Pageable pageable);

    /**
     * Finds user tasks whose due date falls between {@code startDate} and {@code endDate}, inclusive.
     */
    Page<Task> findAllByUserIdAndDueDateBetween(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );
}
