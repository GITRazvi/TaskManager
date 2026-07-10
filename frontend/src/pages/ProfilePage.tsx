// File responsibility: Renders the signed-in user's profile, personal task metrics, and related work.
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Gauge,
  Mail,
  MessageSquareText,
  PencilLine,
  Rows3,
  UserCircle,
  UserRoundCheck
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { Loading } from "../components/Common/Loading";
import { TaskCard } from "../components/Tasks/TaskCard";
import { TaskDetails } from "../components/Tasks/TaskDetails";
import { useCurrentUser } from "../hooks/useAuth";
import { useSprints } from "../hooks/useSprints";
import { useTasks, useUpdateTaskStatus } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import type { Task, TaskStatus } from "../types";
import { roleLabels } from "../utils/permissions";
import { taskStatusLabels, taskStatusOptions } from "../utils/taskStatus";

const today = new Date().toISOString().slice(0, 10);

/**
 * Converts a count into a clamped integer percentage for profile progress UI.
 * value stores the completed amount; total stores the denominator.
 */
function percentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

/**
 * Formats API date strings while keeping empty values readable.
 * value stores an ISO date or date-time string from the backend.
 */
function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

/**
 * Builds a display label for unique values while preserving insertion order.
 * values stores nullable project or sprint names collected from tasks.
 */
function uniqueNamedLinks(values: Array<{ id?: string | null; name?: string | null }>) {
  const linksById = new Map<string, { id: string; name: string }>();

  for (const value of values) {
    if (value.id && value.name) {
      linksById.set(value.id, { id: value.id, name: value.name });
    }
  }

  return [...linksById.values()];
}

/**
 * Renders identity, self-owned work, assigned tasks, and profile-specific metrics for the current user.
 */
export function ProfilePage() {
  const currentUserQuery = useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const assignedTasks = useTasks(
    { assignedToId: user?.id, page: 0, size: 100 },
    { enabled: Boolean(user?.id) }
  );
  const visibleTasks = useTasks({ page: 0, size: 100 }, { enabled: Boolean(user?.id) });
  const sprints = useSprints();
  const users = useUsers();
  const updateStatus = useUpdateTaskStatus();

  const assignedItems = assignedTasks.data?.tasks ?? [];
  const visibleItems = visibleTasks.data?.tasks ?? [];
  const authoredItems = useMemo(
    () => visibleItems.filter((task) => task.userId === user?.id),
    [user?.id, visibleItems]
  );
  const reviewItems = useMemo(
    () => visibleItems.filter((task) => task.reviewerId === user?.id && task.status !== "DONE"),
    [user?.id, visibleItems]
  );
  const relatedItems = useMemo(() => {
    const byId = new Map<string, Task>();
    for (const task of [...assignedItems, ...authoredItems, ...reviewItems]) {
      byId.set(task.id, task);
    }
    return [...byId.values()];
  }, [assignedItems, authoredItems, reviewItems]);

  const statusCounts = useMemo(
    () =>
      taskStatusOptions.reduce(
        (counts, status) => ({ ...counts, [status]: assignedItems.filter((task) => task.status === status).length }),
        {} as Record<TaskStatus, number>
      ),
    [assignedItems]
  );
  const completedTasks = statusCounts.DONE;
  const openTasks = assignedItems.length - completedTasks;
  const overdueTasks = assignedItems.filter((task) => task.status !== "DONE" && task.dueDate && task.dueDate < today).length;
  const dueSoonTasks = assignedItems.filter((task) => {
    if (!task.dueDate || task.status === "DONE") {
      return false;
    }
    const dueTime = new Date(task.dueDate).getTime();
    const now = new Date(today).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return dueTime >= now && dueTime <= now + sevenDays;
  }).length;
  const totalStoryPoints = assignedItems.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0);
  const completedStoryPoints = assignedItems
    .filter((task) => task.status === "DONE")
    .reduce((sum, task) => sum + (task.storyPoints ?? 0), 0);
  const estimatedHours = assignedItems.reduce((sum, task) => sum + Number(task.estimatedHours ?? 0), 0);
  const commentCount = relatedItems.reduce(
    (sum, task) => sum + task.comments.filter((comment) => comment.authorId === user?.id).length,
    0
  );
  const statusChangeCount = relatedItems.reduce(
    (sum, task) => sum + task.statusHistory.filter((entry) => entry.changedById === user?.id).length,
    0
  );
  const projects = uniqueNamedLinks(relatedItems.map((task) => ({ id: task.projectId, name: task.projectName })));
  const sprintLinks = uniqueNamedLinks(relatedItems.map((task) => ({ id: task.sprintId, name: task.sprintName })));
  const sprintMembershipLinks = useMemo(
    () =>
      sprints.data
        ?.filter((sprint) => sprint.participants.some((participant) => participant.id === user?.id))
        .map((sprint) => ({ id: sprint.id, name: sprint.name })) ?? [],
    [sprints.data, user?.id]
  );
  const displayedSprints = sprintLinks.length ? sprintLinks : sprintMembershipLinks;
  const latestActivity = relatedItems
    .flatMap((task) => [
      ...task.statusHistory
        .filter((entry) => entry.changedById === user?.id)
        .map((entry) => ({
          id: `${task.id}-${entry.id ?? entry.createdAt}`,
          taskId: task.id,
          title: task.title,
          label: `Moved to ${taskStatusLabels[entry.toStatus]}`,
          date: entry.createdAt
        })),
      ...task.comments
        .filter((comment) => comment.authorId === user?.id)
        .map((comment) => ({
          id: `${task.id}-${comment.id}`,
          taskId: task.id,
          title: task.title,
          label: comment.attachmentFileName ? `Commented with ${comment.attachmentFileName}` : "Commented",
          date: comment.createdAt
        }))
    ])
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 6);
  const usersById = useMemo(() => new Map(users.data?.map((item) => [item.id, item]) ?? []), [users.data]);
  const sprintsById = useMemo(() => new Map(sprints.data?.map((sprint) => [sprint.id, sprint]) ?? []), [sprints.data]);
  const relatedTasksById = useMemo(() => new Map(relatedItems.map((task) => [task.id, task])), [relatedItems]);

  if (!user && currentUserQuery.isLoading) {
    return <Loading label="Loading profile" />;
  }

  return (
    <div className="page-stack">
      <header className="page-header profile-header">
        <div className="profile-identity">
          <div className="profile-avatar">
            <UserCircle aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Profile</p>
            <h1>{user?.fullName || user?.username || "Account"}</h1>
            <div className="profile-subtitle">
              <span>
                <Mail aria-hidden="true" />
                {user?.email ?? "Email unavailable"}
              </span>
              <span>
                <UserRoundCheck aria-hidden="true" />
                {user?.role ? roleLabels[user.role] : "Role unavailable"}
              </span>
            </div>
          </div>
        </div>
        <Link className="primary-button" to="/tasks">
          <Rows3 aria-hidden="true" />
          Open tasks
        </Link>
      </header>

      {currentUserQuery.isError && <p className="form-error">{getApiErrorMessage(currentUserQuery.error)}</p>}

      <section className="profile-overview">
        <div className="profile-detail">
          <span>Username</span>
          <strong>{user?.username ?? "Unavailable"}</strong>
        </div>
        <div className="profile-detail">
          <span>Account status</span>
          <strong>{user?.active ? "Active" : "Inactive"}</strong>
        </div>
        <div className="profile-detail">
          <span>Member since</span>
          <strong>{formatDate(user?.createdAt)}</strong>
        </div>
        <div className="profile-detail">
          <span>Last profile update</span>
          <strong>{formatDate(user?.updatedAt)}</strong>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>My Metrics</h2>
            <p>{assignedTasks.data ? `${assignedTasks.data.totalElements} assigned tasks tracked` : "Loading workload"}</p>
          </div>
        </div>
        {assignedTasks.isLoading && <Loading label="Loading personal metrics" />}
        {assignedTasks.isError && <p className="form-error">{getApiErrorMessage(assignedTasks.error)}</p>}
        <div className="stats-grid profile-metrics-grid">
          <div className="stat">
            <CircleDot aria-hidden="true" />
            <span>Open tasks</span>
            <strong>{openTasks}</strong>
          </div>
          <div className="stat">
            <CheckCircle2 aria-hidden="true" />
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>
          <div className="stat">
            <AlertTriangle aria-hidden="true" />
            <span>Overdue</span>
            <strong>{overdueTasks}</strong>
          </div>
          <div className="stat">
            <CalendarDays aria-hidden="true" />
            <span>Due soon</span>
            <strong>{dueSoonTasks}</strong>
          </div>
          <div className="stat">
            <Gauge aria-hidden="true" />
            <span>Story points</span>
            <strong>
              {completedStoryPoints}/{totalStoryPoints}
            </strong>
          </div>
          <div className="stat">
            <Clock3 aria-hidden="true" />
            <span>Estimated hours</span>
            <strong>{estimatedHours}</strong>
          </div>
        </div>
        <div className="profile-progress-grid">
          <div className="stats-chart" aria-label={`Assigned task completion ${percentage(completedTasks, assignedItems.length)}%`}>
            <div>
              <span>Task completion</span>
              <strong>{percentage(completedTasks, assignedItems.length)}%</strong>
            </div>
            <div className="stats-bar">
              <span style={{ width: `${percentage(completedTasks, assignedItems.length)}%` }} />
            </div>
          </div>
          <div className="stats-chart" aria-label={`Story point completion ${percentage(completedStoryPoints, totalStoryPoints)}%`}>
            <div>
              <span>Story point completion</span>
              <strong>{percentage(completedStoryPoints, totalStoryPoints)}%</strong>
            </div>
            <div className="stats-bar stats-bar-points">
              <span style={{ width: `${percentage(completedStoryPoints, totalStoryPoints)}%` }} />
            </div>
          </div>
        </div>
        <div className="status-breakdown profile-status-breakdown">
          {taskStatusOptions.map((status) => (
            <div className="status-row" key={status}>
              <span>{taskStatusLabels[status]}</span>
              <div className="stats-bar">
                <span style={{ width: `${percentage(statusCounts[status], assignedItems.length)}%` }} />
              </div>
              <strong>{statusCounts[status]}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="split-layout profile-split">
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Assigned To Me</h2>
              <p>{assignedItems.length ? "Current workload" : "No assigned work"}</p>
            </div>
            <Link className="text-link" to={`/tasks?assignedToId=${user?.id ?? ""}`}>
              View all <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="task-list profile-task-list">
            {assignedItems.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={task.assignedToId ? usersById.get(task.assignedToId) : user ?? undefined}
                onOpen={() => setSelectedTask(task)}
                onStatusChange={(status) => updateStatus.mutate({ id: task.id, status })}
              />
            ))}
            {assignedItems.length === 0 && <p className="empty-state">No tasks are assigned to you.</p>}
          </div>
        </section>

        <aside className="side-panel profile-side-panel">
          <section>
            <div className="section-heading">
              <div>
                <h2>Related Work</h2>
                <p>Tasks created, reviewed, or assigned to you</p>
              </div>
            </div>
            <div className="profile-related-grid">
              <div className="profile-detail">
                <span>Created tasks</span>
                <strong>{authoredItems.length}</strong>
              </div>
              <div className="profile-detail">
                <span>Review queue</span>
                <strong>{reviewItems.length}</strong>
              </div>
              <div className="profile-detail">
                <span>Comments</span>
                <strong>{commentCount}</strong>
              </div>
              <div className="profile-detail">
                <span>Status changes</span>
                <strong>{statusChangeCount}</strong>
              </div>
            </div>
          </section>

          <section className="profile-list-section">
            <h2>Tasks</h2>
            <div className="profile-chip-list">
              {relatedItems.slice(0, 8).map((task) => (
                <button key={task.id} type="button" onClick={() => setSelectedTask(task)}>
                  {task.title}
                </button>
              ))}
              {relatedItems.length === 0 && <p className="empty-state">No related tasks yet.</p>}
            </div>
          </section>

          <section className="profile-list-section">
            <h2>Projects</h2>
            <div className="profile-chip-list">
              {projects.slice(0, 8).map((project) => (
                <Link key={project.id} to={`/projects?project=${project.id}`}>
                  {project.name}
                </Link>
              ))}
              {projects.length === 0 && <p className="empty-state">No related projects yet.</p>}
            </div>
          </section>

          <section className="profile-list-section">
            <h2>Sprints</h2>
            <div className="profile-chip-list">
              {displayedSprints.slice(0, 8).map((sprint) => (
                <Link key={sprint.id} to={`/sprints?sprint=${sprint.id}`}>
                  {sprint.name}
                </Link>
              ))}
              {displayedSprints.length === 0 && <p className="empty-state">No sprint memberships yet.</p>}
            </div>
          </section>

          <section className="profile-list-section">
            <h2>Recent Activity</h2>
            <div className="profile-activity-list">
              {latestActivity.map((activity) => (
                <div className="profile-activity-row" key={activity.id}>
                  {activity.label === "Commented" || activity.label.startsWith("Commented with") ? (
                    <MessageSquareText aria-hidden="true" />
                  ) : (
                    <PencilLine aria-hidden="true" />
                  )}
                  <div>
                    <strong>{activity.label}</strong>
                    <button
                      className="profile-inline-link"
                      type="button"
                      onClick={() => {
                        const task = relatedTasksById.get(activity.taskId);
                        if (task) {
                          setSelectedTask(task);
                        }
                      }}
                    >
                      {activity.title}
                    </button>
                  </div>
                  <time>{formatDate(activity.date)}</time>
                </div>
              ))}
              {latestActivity.length === 0 && <p className="empty-state">No recent activity recorded.</p>}
            </div>
          </section>
        </aside>
      </div>

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          assignee={selectedTask.assignedToId ? usersById.get(selectedTask.assignedToId) : undefined}
          reviewer={selectedTask.reviewerId ? usersById.get(selectedTask.reviewerId) : undefined}
          sprint={selectedTask.sprintId ? sprintsById.get(selectedTask.sprintId) : undefined}
          sprints={sprints.data ?? []}
          users={users.data ?? []}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={setSelectedTask}
        />
      )}
    </div>
  );
}
