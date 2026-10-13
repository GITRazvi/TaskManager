// File responsibility: Renders the task management page with task creation and task list sections.
import { TaskList } from "../components/Tasks/TaskList";
import { useProjects } from "../hooks/useProjects";
import { useSprints } from "../hooks/useSprints";
import { useUsers } from "../hooks/useUsers";

/**
 * Renders the task workspace and applies a developer-only self-assignee filter.
 */
export function TasksPage() {
  const sprints = useSprints();
  const projects = useProjects();
  const users = useUsers();

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1>Tasks</h1>
        </div>
      </header>
      <TaskList
        sprints={sprints.data ?? []}
        projects={projects.data ?? []}
        users={users.data ?? []}
      />
    </div>
  );
}
