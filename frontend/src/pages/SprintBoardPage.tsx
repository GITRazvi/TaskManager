import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SprintBoard } from "../components/Sprints/SprintBoard";
import { SprintForm } from "../components/Sprints/SprintForm";
import { SprintStats } from "../components/Sprints/SprintStats";
import { useSprints } from "../hooks/useSprints";

export function SprintBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sprints = useSprints();
  const initialSprintId = searchParams.get("sprint") ?? undefined;
  const [selectedSprintId, setSelectedSprintId] = useState<string | undefined>(initialSprintId);

  const selectedSprint = useMemo(
    () => sprints.data?.find((sprint) => sprint.id === selectedSprintId),
    [selectedSprintId, sprints.data]
  );

  useEffect(() => {
    if (!selectedSprintId && sprints.data?.length) {
      setSelectedSprintId(sprints.data[0].id);
    }
  }, [selectedSprintId, sprints.data]);

  const updateSelectedSprint = (id: string) => {
    setSelectedSprintId(id);
    setSearchParams({ sprint: id });
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Delivery</p>
          <h1>Sprints</h1>
        </div>
        <select
          aria-label="Selected sprint"
          value={selectedSprintId ?? ""}
          onChange={(event) => updateSelectedSprint(event.target.value)}
        >
          <option value="" disabled>
            Select sprint
          </option>
          {sprints.data?.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </header>

      <div className="split-layout">
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>{selectedSprint?.name ?? "Sprint Board"}</h2>
              <p>{selectedSprint ? `${selectedSprint.status} · ${selectedSprint.taskCount} tasks` : "No sprint selected"}</p>
            </div>
          </div>
          <SprintStats sprintId={selectedSprintId} />
          <SprintBoard sprintId={selectedSprintId} />
        </section>
        <aside className="side-panel">
          <SprintForm onCreated={updateSelectedSprint} />
        </aside>
      </div>
    </div>
  );
}
