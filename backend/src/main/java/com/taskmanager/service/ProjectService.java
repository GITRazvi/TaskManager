// File responsibility: Implements project creation, listing, and owner-only updates.
package com.taskmanager.service;

import com.taskmanager.dto.ProjectCreateRequest;
import com.taskmanager.dto.ProjectResponse;
import com.taskmanager.dto.ProjectUpdateRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, UUID userId, UserRole userRole) {
        ensureCanManageProjects(userRole);
        User user = getUser(userId);

        Project project = new Project();
        project.setUser(user);
        project.setName(request.name());
        project.setDescription(request.description());

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUserProjects(UUID userId) {
        return projectRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID projectId, UUID userId) {
        return ProjectResponse.from(getOwnedProject(projectId, userId));
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, UUID userId, UserRole userRole, ProjectUpdateRequest request) {
        ensureCanManageProjects(userRole);
        Project project = getOwnedProject(projectId, userId);

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_PROJECT_NAME", "Project name cannot be blank");
            }
            project.setName(request.name());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }

        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId, UserRole userRole) {
        ensureCanManageProjects(userRole);
        projectRepository.delete(getOwnedProject(projectId, userId));
    }

    private Project getOwnedProject(UUID projectId, UUID userId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureCanManageProjects(UserRole role) {
        if (!role.canManageProjects()) {
            throw new ForbiddenException("Only admins and project managers can manage projects");
        }
    }
}
