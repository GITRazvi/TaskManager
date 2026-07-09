// File responsibility: Renders sprint-board filtering controls for assignee, status, priority, and text search.
import { Filter, X } from "lucide-react";
import { useMemo } from "react";
import type { Project, Sprint, TaskPriority, TaskStatus, User } from "../../types";
import { taskStatusLabels, taskStatusOptions } from "../../utils/taskStatus";

export interface SprintBoardFilterState {
  assigneeId?: string;
  priority?: TaskPriority;
  dueFrom?: string;
  dueUntil?: string;
  projectId?: string;
  status?: TaskStatus;
  reviewerId?: string;
}

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const unassignedValue = "__unassigned__";

/**
 * Formats a user option for filter dropdowns.
 * user stores display name, username, and email fallback data.
 */
function userLabel(user: User) {
  return user.fullName || user.username;
}

/**
 * Renders sprint board filters and emits updated filter state.
 * filters stores current filter values; users/projects store option lists; onChange receives merged updates.
 */
export function SprintBoardFilters({
  filters,
  onChange,
  projects,
  selectedSprintId,
  sprints,
  users,
  onSprintChange
}: {
  filters: SprintBoardFilterState;
  onChange: (filters: SprintBoardFilterState) => void;
  projects: Project[];
  selectedSprintId?: string;
  sprints: Sprint[];
  users: User[];
  onSprintChange: (sprintId: string) => void;
}) {
  const filterUsers = useMemo(() => {
    const usersById = new Map(users.map((user) => [user.id, user]));
    for (const sprint of sprints) {
      for (const participant of sprint.participants ?? []) {
        usersById.set(participant.id, participant);
      }
    }

    return Array.from(usersById.values()).sort((first, second) => userLabel(first).localeCompare(userLabel(second)));
  }, [sprints, users]);

  const hasFilters = Object.values(filters).some(Boolean);
  const changeFilter = <Key extends keyof SprintBoardFilterState>(
    key: Key,
    value: SprintBoardFilterState[Key] | ""
  ) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="sprint-board-filters">
      <div className="filter-heading">
        <span>
          <Filter aria-hidden="true" />
          Board filters
        </span>
        <button
          className="secondary-button"
          type="button"
          disabled={!hasFilters}
          onClick={() => onChange({})}
        >
          <X aria-hidden="true" />
          Clear
        </button>
      </div>
      <div className="filters filters-expanded">
        <label className="filter-field">
          <span>Project</span>
          <select
            aria-label="Project filter"
            value={filters.projectId ?? ""}
            onChange={(event) => changeFilter("projectId", event.target.value)}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Sprint</span>
          <select
            aria-label="Sprint filter"
            value={selectedSprintId ?? ""}
            onChange={(event) => onSprintChange(event.target.value)}
          >
            <option value="" disabled>
              Select sprint
            </option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Status</span>
          <select
            aria-label="Status filter"
            value={filters.status ?? ""}
            onChange={(event) => changeFilter("status", event.target.value as TaskStatus | "")}
          >
            <option value="">All statuses</option>
            {taskStatusOptions.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Priority</span>
          <select
            aria-label="Priority filter"
            value={filters.priority ?? ""}
            onChange={(event) => changeFilter("priority", event.target.value as TaskPriority | "")}
          >
            <option value="">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Assignee</span>
          <select
            aria-label="Assignee filter"
            value={filters.assigneeId ?? ""}
            onChange={(event) => changeFilter("assigneeId", event.target.value)}
          >
            <option value="">All assignees</option>
            <option value={unassignedValue}>Unassigned</option>
            {filterUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {userLabel(user)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Reviewer</span>
          <select
            aria-label="Reviewer filter"
            value={filters.reviewerId ?? ""}
            onChange={(event) => changeFilter("reviewerId", event.target.value)}
          >
            <option value="">All reviewers</option>
            <option value={unassignedValue}>Needs reviewer</option>
            {filterUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {userLabel(user)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Due from</span>
          <input
            aria-label="Due from filter"
            type="date"
            value={filters.dueFrom ?? ""}
            onChange={(event) => changeFilter("dueFrom", event.target.value)}
          />
        </label>

        <label className="filter-field">
          <span>Due until</span>
          <input
            aria-label="Due until filter"
            type="date"
            value={filters.dueUntil ?? ""}
            onChange={(event) => changeFilter("dueUntil", event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export { unassignedValue };
