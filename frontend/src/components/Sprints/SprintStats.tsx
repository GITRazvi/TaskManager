import { CheckCircle2, Gauge, ListTodo, TrendingUp } from "lucide-react";
import { getApiErrorMessage } from "../../api/client";
import { useSprintStats } from "../../hooks/useSprints";
import { Loading } from "../Common/Loading";

export function SprintStats({ sprintId }: { sprintId?: string }) {
  const stats = useSprintStats(sprintId);

  if (!sprintId) return null;
  if (stats.isLoading) return <Loading label="Loading stats" />;
  if (stats.isError) return <p className="form-error">{getApiErrorMessage(stats.error)}</p>;
  if (!stats.data) return null;

  const items = [
    { label: "Tasks", value: stats.data.totalTasks, icon: ListTodo },
    { label: "Done", value: stats.data.completedTasks, icon: CheckCircle2 },
    { label: "Completion", value: `${Math.round(stats.data.completionPercentage)}%`, icon: Gauge },
    { label: "Velocity", value: stats.data.velocity, icon: TrendingUp }
  ];

  return (
    <div className="stats-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="stat" key={item.label}>
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        );
      })}
    </div>
  );
}
