// File responsibility: Renders sprint-level metrics and progress charts.
import { AlertTriangle, CheckCircle2, CircleDot, Gauge } from "lucide-react";
import { getApiErrorMessage } from "../../api/client";
import { useSprintStats } from "../../hooks/useSprints";
import { Loading } from "../Common/Loading";

/**
 * Converts a metric count into a clamped percentage for sprint progress bars.
 * value stores the completed amount; total stores the denominator for the metric.
 */
function percentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

/**
 * Renders sprint-scoped metrics for the selected sprint.
 * sprintId stores the sprint UUID and disables metric loading when missing.
 */
export function SprintStats({ sprintId }: { sprintId?: string }) {
  const stats = useSprintStats(sprintId);

  if (!sprintId) return null;
  if (stats.isLoading) return <Loading label="Loading stats" />;
  if (stats.isError) return <p className="form-error">{getApiErrorMessage(stats.error)}</p>;
  if (!stats.data) return null;

  const taskCompletion = percentage(stats.data.completedTasks, stats.data.totalTasks);
  const storyPointCompletion = percentage(stats.data.completedStoryPoints, stats.data.totalStoryPoints);
  const items = [
    { label: "Completed points", value: stats.data.completedStoryPoints, icon: CheckCircle2 },
    { label: "Remaining points", value: stats.data.remainingStoryPoints, icon: Gauge },
    { label: "Tasks done", value: `${stats.data.completedTasks}/${stats.data.totalTasks}`, icon: CircleDot },
    { label: "Overdue tasks", value: stats.data.overdueTasks, icon: AlertTriangle }
  ];

  return (
    <div className="stats-panel">
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
      <div className="stats-visuals">
        <div className="stats-chart" aria-label={`Tasks done ${taskCompletion}%`}>
          <div>
            <span>Tasks done vs total</span>
            <strong>{taskCompletion}%</strong>
          </div>
          <div className="stats-bar">
            <span style={{ width: `${taskCompletion}%` }} />
          </div>
        </div>
        <div className="stats-chart" aria-label={`Story points completed ${storyPointCompletion}%`}>
          <div>
            <span>Story points completed</span>
            <strong>{storyPointCompletion}%</strong>
          </div>
          <div className="stats-bar stats-bar-points">
            <span style={{ width: `${storyPointCompletion}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
