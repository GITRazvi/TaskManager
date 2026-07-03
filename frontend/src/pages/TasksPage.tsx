import { useState } from "react";
import { TaskForm } from "../components/Tasks/TaskForm";
import { TaskList } from "../components/Tasks/TaskList";
import { useSprints } from "../hooks/useSprints";
import type { Task } from "../types";

export function TasksPage() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const sprints = useSprints();

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1>Tasks</h1>
        </div>
      </header>
      <div className="split-layout">
        <TaskList onEdit={setEditingTask} />
        <aside className="side-panel">
          <TaskForm sprints={sprints.data ?? []} editingTask={editingTask} onDone={() => setEditingTask(null)} />
          {editingTask && (
            <button className="secondary-button" type="button" onClick={() => setEditingTask(null)}>
              Cancel edit
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
