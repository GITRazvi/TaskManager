// File responsibility: Exposes sprint REST endpoints for listing, creating, updating, board retrieval, and statistics.
package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.SprintBoardResponse;
import com.taskmanager.dto.SprintCreateRequest;
import com.taskmanager.dto.SprintResponse;
import com.taskmanager.dto.SprintStatsResponse;
import com.taskmanager.dto.SprintUpdateRequest;
import com.taskmanager.entity.enums.SprintStatus;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.SprintService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {
    private final SprintService sprintService;

    /**
     * Creates the sprint controller with the service that owns sprint business rules.
     */
    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    /**
     * Lists sprints owned by the authenticated user, optionally narrowed by the {@code status} query parameter.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SprintResponse>>> getSprints(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) SprintStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                sprintService.getUserSprints(principal.getId(), status),
                "Sprints retrieved successfully"
        ));
    }

    /**
     * Retrieves one sprint by {@code id}, using the authenticated principal id to enforce ownership.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SprintResponse>> getSprint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                sprintService.getSprintById(id, principal.getId()),
                "Sprint retrieved successfully"
        ));
    }

    /**
     * Creates a sprint for the authenticated user from the validated request dates, name, and description.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SprintResponse>> createSprint(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SprintCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        sprintService.createSprint(request, principal.getId()),
                        "Sprint created successfully"
                ));
    }

    /**
     * Updates a sprint identified by {@code id}; the principal id is required so users can only edit their own sprint.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SprintUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                sprintService.updateSprint(id, principal.getId(), request),
                "Sprint updated successfully"
        ));
    }

    /**
     * Builds the sprint board for {@code id}, grouping owned sprint tasks into todo, in-progress, and done columns.
     */
    @GetMapping("/{id}/tasks")
    public ResponseEntity<ApiResponse<SprintBoardResponse>> getBoard(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                sprintService.getSprintBoard(id, principal.getId()),
                "Sprint board retrieved successfully"
        ));
    }

    /**
     * Calculates task totals, completion, velocity, and priority breakdown for the owned sprint {@code id}.
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<SprintStatsResponse>> getStats(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                sprintService.getSprintStats(id, principal.getId()),
                "Sprint stats retrieved successfully"
        ));
    }
}
