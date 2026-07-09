// File responsibility: Renders the dashboard with project-wide metrics, recent tasks, and active sprint links.
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDot, Gauge, Rows3 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { Loading } from "../components/Common/Loading";
import { TaskFilters } from "../components/Tasks/TaskFilters";
import { useCurrentUser } from "../hooks/useAuth";
import { useSprints } from "../hooks/useSprints";
import { useTasks, useTaskStats } from "../hooks/useTasks";
import { useAuthStore } from "../store/authStore";
import type { TaskFilters as Filters, TaskStatus } from "../types";
import { taskStatusLabels } from "../utils/taskStatus";

const statusOrder: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

/**
 * Converts a count into a clamped percentage for progress bars.
 * value stores the completed amount; total stores the denominator for the metric.
 */
function percentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

/**
 * Renders dashboard data for the signed-in user, including project-wide metrics and recent task filters.
 */
export function DashboardPage() {
  useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const [filters, setFilters] = useState<Filters>({ page: 0, size: 8 });
  const tasks = useTasks(filters);
  const taskStats = useTaskStats();
  const sprints = useSprints();

  const taskItems = tasks.data?.tasks ?? [];
  const projectStats = taskStats.data ?? [];
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

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Project Metrics</h2>
            <p>{projectStats.length ? `${projectStats.length} projects with visible sprint work` : "Loading project work"}</p>
          </div>
        </div>
        {taskStats.isLoading && <Loading label="Loading project metrics" />}
        {taskStats.isError && <p className="form-error">{getApiErrorMessage(taskStats.error)}</p>}
        {taskStats.data?.length === 0 && <p className="empty-state">No project metrics yet.</p>}
        {projectStats.map((stats) => {
          const taskCompletion = percentage(stats.completedTasks, stats.totalTasks);
          const storyPointCompletion = percentage(stats.completedStoryPoints, stats.totalStoryPoints);

          return (
          <div className="stats-panel project-metrics-panel" key={stats.projectId}>
            <div className="section-heading project-metrics-heading">
              <div>
                <h2>{stats.projectName}</h2>
                <p>{stats.totalTasks} tasks</p>
              </div>
              <Link className="text-link" to={`/projects?project=${stats.projectId}`}>
                Open project <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="stats-grid">
              <div className="stat">
                <CheckCircle2 aria-hidden="true" />
                <span>Completed points</span>
                <strong>{stats.completedStoryPoints}</strong>
              </div>
              <div className="stat">
                <Gauge aria-hidden="true" />
                <span>Remaining points</span>
                <strong>{stats.remainingStoryPoints}</strong>
              </div>
              <div className="stat">
                <CircleDot aria-hidden="true" />
                <span>Tasks done</span>
                <strong>
                  {stats.completedTasks}/{stats.totalTasks}
                </strong>
              </div>
              <div className="stat">
                <AlertTriangle aria-hidden="true" />
                <span>Overdue tasks</span>
                <strong>{stats.overdueTasks}</strong>
              </div>
            </div>
            <div className="stats-visuals">
              <div className="stats-chart" aria-label={`${stats.projectName} tasks done ${taskCompletion}%`}>
                <div>
                  <span>Tasks done vs total</span>
                  <strong>{taskCompletion}%</strong>
                </div>
                <div className="stats-bar">
                  <span style={{ width: `${taskCompletion}%` }} />
                </div>
              </div>
              <div className="stats-chart" aria-label={`${stats.projectName} story points completed ${storyPointCompletion}%`}>
                <div>
                  <span>Story points completed</span>
                  <strong>{storyPointCompletion}%</strong>
                </div>
                <div className="stats-bar stats-bar-points">
                  <span style={{ width: `${storyPointCompletion}%` }} />
                </div>
              </div>
            </div>
            <div className="stats-chart">
              <div>
                <span>Workflow status</span>
                <strong>{stats.totalTasks}</strong>
              </div>
              <div className="status-breakdown">
                {statusOrder.map((status) => {
                  const count = stats.tasksByStatus[status] ?? 0;
                  return (
                    <div className="status-row" key={status}>
                      <span>{taskStatusLabels[status]}</span>
                      <div className="stats-bar">
                        <span style={{ width: `${percentage(count, stats.totalTasks)}%` }} />
                      </div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })}
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
        <TaskFilters filters={filters} onChange={(nextFilters) => setFilters({ ...nextFilters, size: 8 })} />
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
