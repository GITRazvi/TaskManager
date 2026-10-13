// File responsibility: Centralizes frontend permission checks for project-scoped roles.
import type { Project, ProjectRole, Sprint, Task, User } from "../types";

export const roleLabels: Record<ProjectRole, string> = {
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
  QA_TESTER: "QA / Tester",
  PRODUCT_OWNER: "Product Owner",
  SCRUM_MASTER: "Scrum Master",
  VIEWER: "Viewer / Stakeholder"
};

export const projectRoles: ProjectRole[] = [
  "PROJECT_MANAGER",
  "DEVELOPER",
  "QA_TESTER",
  "PRODUCT_OWNER",
  "SCRUM_MASTER",
  "VIEWER"
];

export function getProjectRole(project?: Pick<Project, "role"> | null): ProjectRole | null {
  return project?.role ?? null;
}

export function getRoleForSprint(
  sprint: Pick<Sprint, "projectId"> | null | undefined,
  projects: Pick<Project, "id" | "role">[]
): ProjectRole | null {
  if (!sprint) {
    return null;
  }
  return projects.find((project) => project.id === sprint.projectId)?.role ?? null;
}

export function getRoleForTask(
  task: Pick<Task, "projectId" | "userId">,
  projects: Pick<Project, "id" | "role">[],
  user?: Pick<User, "id"> | null
): ProjectRole | null {
  if (!task.projectId) {
    return task.userId === user?.id ? "DEVELOPER" : null;
  }
  return projects.find((project) => project.id === task.projectId)?.role ?? null;
}

export function canManageProject(project?: Pick<Project, "role"> | null) {
  return getProjectRole(project) === "PROJECT_MANAGER";
}

export function canManageSprintsForRole(role?: ProjectRole | null) {
  return role === "PROJECT_MANAGER" || role === "SCRUM_MASTER";
}

export function canCreateTasksForRole(role?: ProjectRole | null) {
  return Boolean(role && role !== "VIEWER");
}

export function canTransitionTaskStatusForRole(role?: ProjectRole | null) {
  return Boolean(role && role !== "VIEWER");
}

export function canEditTaskForRole(role: ProjectRole | null | undefined, user: Pick<User, "id"> | null | undefined, task: Task) {
  return Boolean(role && role !== "VIEWER" && (role === "PROJECT_MANAGER" || task.userId === user?.id));
}

export function canSetTaskMetadataForRole(role?: ProjectRole | null) {
  return Boolean(role && role !== "VIEWER");
}

export function canAssignTaskToForRole(role: ProjectRole | null | undefined, userId?: string, targetUserId?: string) {
  return role === "PROJECT_MANAGER" ||
    role === "SCRUM_MASTER" ||
    !targetUserId ||
    targetUserId === userId;
}
