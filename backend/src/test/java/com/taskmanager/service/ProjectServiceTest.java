// File responsibility: Tests project creation and update validation behavior.
package com.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskmanager.dto.ProjectCreateRequest;
import com.taskmanager.dto.ProjectMemberCreateRequest;
import com.taskmanager.dto.ProjectUpdateRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.ProjectRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository, userRepository, projectMemberRepository);
    }

    @Test
    void createProjectSavesProjectForActiveUser() {
        UUID userId = UUID.randomUUID();
        User user = activeUser(userId);
        ProjectCreateRequest request = new ProjectCreateRequest("Roadmap", "Release planning");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project project = invocation.getArgument(0);
            project.setId(UUID.randomUUID());
            return project;
        });
        when(projectMemberRepository.save(any(ProjectMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = projectService.createProject(request, userId);

        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.name()).isEqualTo("Roadmap");
        assertThat(response.description()).isEqualTo("Release planning");
        assertThat(response.role()).isEqualTo(ProjectRole.PROJECT_MANAGER);

        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(projectCaptor.capture());
        assertThat(projectCaptor.getValue().getUser()).isSameAs(user);
    }

    @Test
    void updateProjectRejectsBlankName() {
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setUser(activeUser(userId));
        project.setName("Roadmap");
        when(projectRepository.findAccessibleByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(projectMemberRepository.findRoleByProjectIdAndUserId(projectId, userId)).thenReturn(Optional.of(ProjectRole.PROJECT_MANAGER));

        assertThatThrownBy(() -> projectService.updateProject(
                projectId,
                userId,
                new ProjectUpdateRequest(" ", null)
        ))
                .isInstanceOf(AppException.class)
                .hasMessage("Project name cannot be blank")
                .extracting("errorCode")
                .isEqualTo("INVALID_PROJECT_NAME");
    }

    @Test
    void addMemberSavesProjectRole() {
        UUID projectId = UUID.randomUUID();
        UUID managerId = UUID.randomUUID();
        UUID developerId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setUser(activeUser(managerId));
        User developer = activeUser(developerId);
        when(projectRepository.findAccessibleByIdAndUserId(projectId, managerId)).thenReturn(Optional.of(project));
        when(projectMemberRepository.findRoleByProjectIdAndUserId(projectId, managerId)).thenReturn(Optional.of(ProjectRole.PROJECT_MANAGER));
        when(userRepository.findActiveByUsernameOrEmail("alex")).thenReturn(Optional.of(developer));
        when(projectMemberRepository.existsByProjectIdAndUserId(projectId, developerId)).thenReturn(false);
        when(projectMemberRepository.save(any(ProjectMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = projectService.addMember(
                projectId,
                managerId,
                new ProjectMemberCreateRequest("alex", ProjectRole.DEVELOPER)
        );

        assertThat(response.userId()).isEqualTo(developerId);
        assertThat(response.role()).isEqualTo(ProjectRole.DEVELOPER);
    }

    private static User activeUser(UUID userId) {
        User user = new User();
        user.setId(userId);
        user.setUsername("alex");
        user.setEmail("alex@example.com");
        user.setActive(true);
        return user;
    }
}
