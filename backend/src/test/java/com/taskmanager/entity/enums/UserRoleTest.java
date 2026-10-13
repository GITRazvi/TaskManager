// File responsibility: Verifies role capability mappings used by service-layer authorization checks.
package com.taskmanager.entity.enums;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class UserRoleTest {
    @Test
    void supportsRequestedAssignableRoles() {
        assertThat(UserRole.values())
                .extracting(Enum::name)
                .containsExactly(
                        "ADMIN",
                        "PROJECT_MANAGER",
                        "DEVELOPER",
                        "QA_TESTER",
                        "PRODUCT_OWNER",
                        "SCRUM_MASTER",
                        "VIEWER"
                );
    }

    @Test
    void mapsRoleCapabilitiesToExistingPermissionBoundaries() {
        assertThat(UserRole.ADMIN.canManageUsers()).isTrue();
        assertThat(UserRole.PROJECT_MANAGER.canManageProjects()).isTrue();
        assertThat(UserRole.SCRUM_MASTER.canManageSprints()).isTrue();
        assertThat(UserRole.PRODUCT_OWNER.canSetTaskMetadata()).isTrue();
        assertThat(UserRole.QA_TESTER.canCreateTasks()).isTrue();
        assertThat(UserRole.DEVELOPER.canTransitionTasks()).isTrue();
        assertThat(UserRole.SCRUM_MASTER.canAssignTasks()).isTrue();

        assertThat(UserRole.DEVELOPER.canManageProjects()).isFalse();
        assertThat(UserRole.QA_TESTER.canManageSprints()).isFalse();
        assertThat(UserRole.PRODUCT_OWNER.canAssignTasks()).isFalse();
        assertThat(UserRole.VIEWER.canEditAnyVisibleTask()).isFalse();
        assertThat(UserRole.VIEWER.canSetTaskMetadata()).isFalse();
        assertThat(UserRole.VIEWER.canCreateTasks()).isFalse();
        assertThat(UserRole.VIEWER.canTransitionTasks()).isFalse();
    }
}
