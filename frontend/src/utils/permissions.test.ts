// File responsibility: Verifies frontend project role labels and permission helpers.
import { describe, expect, it } from "vitest";
import {
  canCreateTasksForRole,
  canEditTaskForRole,
  canManageProject,
  canManageSprintsForRole,
  canSetTaskMetadataForRole,
  canTransitionTaskStatusForRole,
  projectRoles,
  roleLabels
} from "./permissions";

describe("permissions", () => {
  it("exposes all assignable project role labels", () => {
    expect(projectRoles).toEqual([
      "PROJECT_MANAGER",
      "DEVELOPER",
      "QA_TESTER",
      "PRODUCT_OWNER",
      "SCRUM_MASTER",
      "VIEWER"
    ]);
    expect(roleLabels.QA_TESTER).toBe("QA / Tester");
    expect(roleLabels.VIEWER).toBe("Viewer / Stakeholder");
  });

  it("maps project permissions to role descriptions", () => {
    expect(canManageProject({ role: "PROJECT_MANAGER" })).toBe(true);
    expect(canManageSprintsForRole("SCRUM_MASTER")).toBe(true);
    expect(canEditTaskForRole("PRODUCT_OWNER", { id: "u2" }, { id: "t1", userId: "u1" } as any)).toBe(false);
    expect(canManageProject({ role: "VIEWER" })).toBe(false);
    expect(canCreateTasksForRole("VIEWER")).toBe(false);
    expect(canTransitionTaskStatusForRole("VIEWER")).toBe(false);
    expect(canSetTaskMetadataForRole("VIEWER")).toBe(false);
  });
});
