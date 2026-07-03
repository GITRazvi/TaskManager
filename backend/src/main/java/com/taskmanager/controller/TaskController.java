// File responsibility: Exposes task REST endpoints for filtering, CRUD operations, deletion, and status changes.
package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.TaskCreateRequest;
import com.taskmanager.dto.TaskListResponse;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskStatusUpdateRequest;
import com.taskmanager.dto.TaskUpdateRequest;
import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    /**
     * Creates the task controller with the service that handles task filtering and mutations.
     */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Lists authenticated-user tasks using optional status, priority, due-date range, and pagination variables.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<TaskListResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        TaskListResponse tasks = taskService.getUserTasks(
                principal.getId(),
                status,
                priority,
                startDate,
                endDate,
                page,
                size
        );
        return ResponseEntity.ok(ApiResponse.success(tasks, "Tasks retrieved successfully"));
    }

    /**
     * Retrieves a single task by {@code id}, scoped to the authenticated user's principal id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.getTaskById(id, principal.getId()),
                "Task retrieved successfully"
        ));
    }

    /**
     * Creates a task for the authenticated user from the validated request fields and optional sprint/assignee ids.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        taskService.createTask(request, principal.getId()),
                        "Task created successfully"
                ));
    }

    /**
     * Applies partial task updates for the owned task {@code id}; null request fields leave existing values unchanged.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.updateTask(id, principal.getId(), request),
                "Task updated successfully"
        ));
    }

    /**
     * Deletes the owned task {@code id}; the principal id prevents deleting another user's task.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        taskService.deleteTask(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates only the status of the owned task {@code id} using the validated request status value.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.updateStatus(id, principal.getId(), request.status()),
                "Task status updated successfully"
        ));
    }
}
