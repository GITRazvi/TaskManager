// File responsibility: Defines application user roles and their coarse-grained permissions.
package com.taskmanager.entity.enums;

public enum UserRole {
    ADMIN,
    PROJECT_MANAGER,
    DEVELOPER,
    QA_TESTER,
    PRODUCT_OWNER,
    SCRUM_MASTER,
    VIEWER;

    public boolean canManageUsers() {
        return this == ADMIN;
    }

    public boolean canManageProjects() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean canManageSprints() {
        return this == ADMIN || this == PROJECT_MANAGER || this == SCRUM_MASTER;
    }

    public boolean canEditAnyVisibleTask() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean canCreateTasks() {
        return this != VIEWER;
    }

    public boolean canTransitionTasks() {
        return this != VIEWER;
    }

    public boolean canAssignTasks() {
        return this == ADMIN || this == PROJECT_MANAGER || this == SCRUM_MASTER;
    }

    public boolean canSetTaskMetadata() {
        return this == ADMIN || this == PROJECT_MANAGER || this == PRODUCT_OWNER || this == SCRUM_MASTER;
    }

    public boolean hasFullAnalyticsAccess() {
        return this == ADMIN || this == PROJECT_MANAGER || this == PRODUCT_OWNER || this == SCRUM_MASTER;
    }
}
