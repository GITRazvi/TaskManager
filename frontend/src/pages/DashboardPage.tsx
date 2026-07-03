import { ArrowRight, CheckCircle2, Clock3, Rows3 } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { Loading } from "../components/Common/Loading";
import { useCurrentUser } from "../hooks/useAuth";
import { useSprints } from "../hooks/useSprints";
import { useTasks } from "../hooks/useTasks";
import { useAuthStore } from "../store/authStore";

export function DashboardPage() {
  useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const tasks = useTasks({ page: 0, size: 8 });
  const sprints = useSprints();

  const taskItems = tasks.data?.tasks ?? [];
  const done = taskItems.filter((task) => task.status === "DONE").length;
  const activeSprint = sprints.data?.find((sprint) => sprint.status === "ACTIVE") ?? sprints.data?.[0];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{user?.fullName || user?.username || "Dashboard"}</h1>
        </div>
        <Link className="primary-button" to="/tasks">
          <Rows3 aria-hidden="true" />
          Open tasks
        </Link>
      </header>

      <section className="metrics-grid">
        <div className="metric">
          <Rows3 aria-hidden="true" />
          <span>Visible tasks</span>
          <strong>{tasks.data?.totalElements ?? 0}</strong>
        </div>
        <div className="metric">
          <CheckCircle2 aria-hidden="true" />
          <span>Done in view</span>
          <strong>{done}</strong>
        </div>
        <div className="metric">
          <Clock3 aria-hidden="true" />
          <span>Sprints</span>
          <strong>{sprints.data?.length ?? 0}</strong>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Recent Tasks</h2>
            <p>{tasks.data ? "Latest page from the API" : "Loading current work"}</p>
          </div>
          <Link className="text-link" to="/tasks">
            View all <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        {tasks.isLoading && <Loading label="Loading tasks" />}
        {tasks.isError && <p className="form-error">{getApiErrorMessage(tasks.error)}</p>}
        <div className="compact-list">
          {taskItems.map((task) => (
            <div className="compact-row" key={task.id}>
              <span>{task.title}</span>
              <strong>{task.status.replace("_", " ")}</strong>
            </div>
          ))}
          {tasks.data?.tasks.length === 0 && <p className="empty-state">No tasks yet.</p>}
        </div>
      </section>

      {activeSprint && (
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>{activeSprint.name}</h2>
              <p>
                {activeSprint.startDate} to {activeSprint.endDate}
              </p>
            </div>
            <Link className="text-link" to={`/sprints?sprint=${activeSprint.id}`}>
              Open board <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
