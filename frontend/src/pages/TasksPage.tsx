import { TaskList } from "../components/Tasks/TaskList";
import { useSprints } from "../hooks/useSprints";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";

export function TasksPage() {
  const sprints = useSprints();
  const users = useUsers();
  const currentUserId = useAuthStore((state) => state.user?.id);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1>Tasks</h1>
        </div>
      </header>
      <TaskList sprints={sprints.data ?? []} users={users.data ?? []} assignedToId={currentUserId} />
    </div>
  );
}
