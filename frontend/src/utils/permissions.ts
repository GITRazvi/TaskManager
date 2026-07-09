// File responsibility: Centralizes frontend permission checks for role-based UI controls and task assignment rules.
import type { Task, User, UserRole } from "../types";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer"
};

/**
 * Returns the user's role, defaulting anonymous or missing users to developer-level permissions.
 * user stores the current authenticated user or a role-only projection.
 */
export function getRole(user?: Pick<User, "role"> | null): UserRole {
  return user?.role ?? "DEVELOPER";
}

/**
 * Checks whether the user can create, update, or delete user accounts.
 * user stores the current authenticated user or a role-only projection.
 */
export function canManageUsers(user?: Pick<User, "role"> | null) {
  return getRole(user) === "ADMIN";
}

/**
 * Checks whether the user can manage project and sprint planning data.
 * user stores the current authenticated user or a role-only projection.
 */
export function canManageProjects(user?: Pick<User, "role"> | null) {
  return getRole(user) === "ADMIN" || getRole(user) === "PROJECT_MANAGER";
}

/**
 * Checks whether the user can manage sprints.
 * user stores the current authenticated user or a role-only projection.
 */
export function canManageSprints(user?: Pick<User, "role"> | null) {
  return canManageProjects(user);
}

/**
 * Checks whether the user can edit all tasks they can see, regardless of ownership.
 * user stores the current authenticated user or a role-only projection.
 */
export function canEditAnyVisibleTask(user?: Pick<User, "role"> | null) {
  return getRole(user) === "ADMIN" || getRole(user) === "PROJECT_MANAGER";
}

/**
 * Checks whether the user can edit the full task body.
 * user stores identity and role; task stores ownership data used for developer-owned task edits.
 */
export function canEditTask(user: Pick<User, "id" | "role"> | null | undefined, task: Task) {
  return Boolean(user && (canEditAnyVisibleTask(user) || task.userId === user.id));
}

/**
 * Checks whether metadata controls should be enabled.
 * user stores the current signed-in user; any authenticated role may edit reviewer, points, priority, and estimates.
 */
export function canSetTaskMetadata(user?: Pick<User, "role"> | null) {
  return Boolean(user);
}

/**
 * Checks whether the user can assign work to the target user.
 * user stores the acting user's id/role; targetUserId stores the assignee being selected, if any.
 */
export function canAssignTaskTo(user: Pick<User, "id" | "role"> | null | undefined, targetUserId?: string) {
  if (!user) {
    return false;
  }
  return canEditAnyVisibleTask(user) || !targetUserId || targetUserId === user.id;
}
