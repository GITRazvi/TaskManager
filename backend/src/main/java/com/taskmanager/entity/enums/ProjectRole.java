// File responsibility: Defines project-scoped roles and their permissions.
package com.taskmanager.entity.enums;

public enum ProjectRole {
    PROJECT_MANAGER,
    DEVELOPER,
    QA_TESTER,
    PRODUCT_OWNER,
    SCRUM_MASTER,
    VIEWER;

    public boolean canManageProjectMembers() {
        return this == PROJECT_MANAGER;
    }

    public boolean canManageProjects() {
        return this == PROJECT_MANAGER;
    }

    public boolean canManageSprints() {
        return this == PROJECT_MANAGER || this == SCRUM_MASTER;
    }

    public boolean canEditAnyVisibleTask() {
        return this == PROJECT_MANAGER;
    }

    public boolean canCreateTasks() {
        return this != VIEWER;
    }

    public boolean canTransitionTasks() {
        return this != VIEWER;
    }

    public boolean canAssignTasks() {
        return this == PROJECT_MANAGER || this == SCRUM_MASTER;
    }

    public boolean canSetTaskMetadata() {
        return this == PROJECT_MANAGER || this == PRODUCT_OWNER || this == SCRUM_MASTER;
    }

    public boolean hasFullAnalyticsAccess() {
        return this == PROJECT_MANAGER || this == PRODUCT_OWNER || this == SCRUM_MASTER;
    }
}
