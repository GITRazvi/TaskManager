// File responsibility: Renders the task management page with task creation and task list sections.
import { TaskList } from "../components/Tasks/TaskList";
import { useSprints } from "../hooks/useSprints";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import { canEditAnyVisibleTask } from "../utils/permissions";

/**
 * Renders the task workspace and applies a developer-only self-assignee filter.
 */
export function TasksPage() {
  const sprints = useSprints();
  const users = useUsers();
  const currentUser = useAuthStore((state) => state.user);
  const assignedToId = canEditAnyVisibleTask(currentUser) ? undefined : currentUser?.id;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1>Tasks</h1>
        </div>
      </header>
      <TaskList sprints={sprints.data ?? []} users={users.data ?? []} assignedToId={assignedToId} />
    </div>
  );
}
