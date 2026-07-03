import type { TaskFilters as Filters, TaskPriority, TaskStatus } from "../../types";

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TaskFilters({
  filters,
  onChange
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <div className="filters">
      <select
        aria-label="Status filter"
        value={filters.status ?? ""}
        onChange={(event) =>
          onChange({ ...filters, status: (event.target.value || undefined) as TaskStatus | undefined, page: 0 })
        }
      >
        <option value="">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replace("_", " ")}
          </option>
        ))}
      </select>
      <select
        aria-label="Priority filter"
        value={filters.priority ?? ""}
        onChange={(event) =>
          onChange({ ...filters, priority: (event.target.value || undefined) as TaskPriority | undefined, page: 0 })
        }
      >
        <option value="">All priorities</option>
        {priorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      <input
        aria-label="Due from"
        type="date"
        value={filters.startDate ?? ""}
        onChange={(event) => onChange({ ...filters, startDate: event.target.value || undefined, page: 0 })}
      />
      <input
        aria-label="Due until"
        type="date"
        value={filters.endDate ?? ""}
        onChange={(event) => onChange({ ...filters, endDate: event.target.value || undefined, page: 0 })}
      />
    </div>
  );
}
