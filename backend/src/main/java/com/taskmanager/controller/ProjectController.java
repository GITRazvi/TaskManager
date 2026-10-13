// File responsibility: Exposes project REST endpoints for listing, creating, retrieving, and updating.
package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.ProjectCreateRequest;
import com.taskmanager.dto.ProjectMemberCreateRequest;
import com.taskmanager.dto.ProjectMemberResponse;
import com.taskmanager.dto.ProjectMemberRoleUpdateRequest;
import com.taskmanager.dto.ProjectResponse;
import com.taskmanager.dto.ProjectUpdateRequest;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.getUserProjects(principal.getId()),
                "Projects retrieved successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.getProjectById(id, principal.getId()),
                "Project retrieved successfully"
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        projectService.createProject(request, principal.getId()),
                        "Project created successfully"
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.updateProject(id, principal.getId(), request),
                "Project updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectService.deleteProject(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> addMember(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectMemberCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        projectService.addMember(id, principal.getId(), request),
                        "Project member added successfully"
                ));
    }

    @PutMapping("/{id}/members/{memberId}/role")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateMemberRole(
            @PathVariable UUID id,
            @PathVariable UUID memberId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectMemberRoleUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.updateMemberRole(id, memberId, principal.getId(), request),
                "Project member role updated successfully"
        ));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectService.removeMember(id, memberId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Project member removed successfully"));
    }
}
