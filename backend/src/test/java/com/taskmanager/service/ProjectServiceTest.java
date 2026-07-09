// File responsibility: Tests project creation and update validation behavior.
package com.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskmanager.dto.ProjectCreateRequest;
import com.taskmanager.dto.ProjectUpdateRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
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

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository, userRepository);
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

        var response = projectService.createProject(request, userId, UserRole.PROJECT_MANAGER);

        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.name()).isEqualTo("Roadmap");
        assertThat(response.description()).isEqualTo("Release planning");

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
        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> projectService.updateProject(
                projectId,
                userId,
                UserRole.PROJECT_MANAGER,
                new ProjectUpdateRequest(" ", null)
        ))
                .isInstanceOf(AppException.class)
                .hasMessage("Project name cannot be blank")
                .extracting("errorCode")
                .isEqualTo("INVALID_PROJECT_NAME");
    }

    @Test
    void createProjectRejectsDeveloper() {
        assertThatThrownBy(() -> projectService.createProject(
                new ProjectCreateRequest("Roadmap", null),
                UUID.randomUUID(),
                UserRole.DEVELOPER
        ))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Only admins and project managers can manage projects");
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
