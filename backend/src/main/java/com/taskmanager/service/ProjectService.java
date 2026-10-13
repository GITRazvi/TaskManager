// File responsibility: Implements project creation, listing, and owner-only updates.
package com.taskmanager.service;

import com.taskmanager.dto.ProjectCreateRequest;
import com.taskmanager.dto.ProjectMemberCreateRequest;
import com.taskmanager.dto.ProjectMemberResponse;
import com.taskmanager.dto.ProjectMemberRoleUpdateRequest;
import com.taskmanager.dto.ProjectResponse;
import com.taskmanager.dto.ProjectUpdateRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.ProjectRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectMemberRepository;
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
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, UUID userId) {
        User user = getUser(userId);

        Project project = new Project();
        project.setUser(user);
        project.setName(request.name());
        project.setDescription(request.description());

        Project savedProject = projectRepository.save(project);
        ProjectMember ownerMembership = new ProjectMember();
        ownerMembership.setProject(savedProject);
        ownerMembership.setUser(user);
        ownerMembership.setRole(ProjectRole.PROJECT_MANAGER);
        savedProject.getMembers().add(projectMemberRepository.save(ownerMembership));

        return ProjectResponse.from(savedProject, userId);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUserProjects(UUID userId) {
        return projectRepository.findAllAccessibleByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(project -> ProjectResponse.from(project, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID projectId, UUID userId) {
        return ProjectResponse.from(getAccessibleProject(projectId, userId), userId);
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, UUID userId, ProjectUpdateRequest request) {
        Project project = getAccessibleProject(projectId, userId);
        ensureCanManageProjects(getProjectRole(projectId, userId));

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_PROJECT_NAME", "Project name cannot be blank");
            }
            project.setName(request.name());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }

        return ProjectResponse.from(project, userId);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        Project project = getAccessibleProject(projectId, userId);
        ensureCanManageProjects(getProjectRole(projectId, userId));
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectMemberResponse addMember(UUID projectId, UUID currentUserId, ProjectMemberCreateRequest request) {
        Project project = getAccessibleProject(projectId, currentUserId);
        ensureCanManageProjectMembers(getProjectRole(projectId, currentUserId));
        User user = userRepository.findActiveByUsernameOrEmail(request.userIdentifier().trim())
                .orElseThrow(() -> new AppException(
                        HttpStatus.BAD_REQUEST,
                        "PROJECT_MEMBER_NOT_FOUND",
                        "No active user found for project member: " + request.userIdentifier().trim()
                ));
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new AppException(HttpStatus.CONFLICT, "PROJECT_MEMBER_EXISTS", "User already belongs to this project");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(request.role());
        return ProjectMemberResponse.from(projectMemberRepository.save(member));
    }

    @Transactional
    public ProjectMemberResponse updateMemberRole(
            UUID projectId,
            UUID memberId,
            UUID currentUserId,
            ProjectMemberRoleUpdateRequest request
    ) {
        ensureCanManageProjectMembers(getProjectRole(projectId, currentUserId));
        ProjectMember member = getProjectMember(projectId, memberId);
        preventRemovingLastProjectManager(member, request.role());
        member.setRole(request.role());
        return ProjectMemberResponse.from(member);
    }

    @Transactional
    public void removeMember(UUID projectId, UUID memberId, UUID currentUserId) {
        ensureCanManageProjectMembers(getProjectRole(projectId, currentUserId));
        ProjectMember member = getProjectMember(projectId, memberId);
        if (member.getUser().getId().equals(currentUserId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_REMOVE_SELF", "You cannot remove yourself from the project");
        }
        preventRemovingLastProjectManager(member, null);
        projectMemberRepository.delete(member);
    }

    private Project getOwnedProject(UUID projectId, UUID userId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private Project getAccessibleProject(UUID projectId, UUID userId) {
        return projectRepository.findAccessibleByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private ProjectMember getProjectMember(UUID projectId, UUID memberId) {
        return projectMemberRepository.findById(memberId)
                .filter(member -> member.getProject().getId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));
    }

    private ProjectRole getProjectRole(UUID projectId, UUID userId) {
        return projectMemberRepository.findRoleByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ForbiddenException("You do not have a role in this project"));
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureCanManageProjects(ProjectRole role) {
        if (!role.canManageProjects()) {
            throw new ForbiddenException("Only project managers can manage projects");
        }
    }

    private void ensureCanManageProjectMembers(ProjectRole role) {
        if (!role.canManageProjectMembers()) {
            throw new ForbiddenException("Only project managers can manage project members");
        }
    }

    private void preventRemovingLastProjectManager(ProjectMember member, ProjectRole replacementRole) {
        if (member.getRole() != ProjectRole.PROJECT_MANAGER || replacementRole == ProjectRole.PROJECT_MANAGER) {
            return;
        }
        if (projectMemberRepository.countByProjectIdAndRole(member.getProject().getId(), ProjectRole.PROJECT_MANAGER) <= 1) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "PROJECT_MANAGER_REQUIRED",
                    "Project must keep at least one project manager"
            );
        }
    }
}
