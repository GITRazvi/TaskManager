// File responsibility: Defines application user roles and their coarse-grained permissions.
package com.taskmanager.entity.enums;

public enum UserRole {
    ADMIN,
    PROJECT_MANAGER,
    DEVELOPER;

    public boolean canManageUsers() {
        return this == ADMIN;
    }

    public boolean canManageProjects() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean canManageSprints() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean canEditAnyVisibleTask() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean canAssignTasks() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean canSetTaskMetadata() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }

    public boolean hasFullAnalyticsAccess() {
        return this == ADMIN || this == PROJECT_MANAGER;
    }
}
