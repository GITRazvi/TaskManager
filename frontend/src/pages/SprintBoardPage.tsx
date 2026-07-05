import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { SprintBoard } from "../components/Sprints/SprintBoard";
import { SprintForm } from "../components/Sprints/SprintForm";
import { SprintStats } from "../components/Sprints/SprintStats";
import { useDeleteSprint, useSprints } from "../hooks/useSprints";
import { useUsers } from "../hooks/useUsers";

export function SprintBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sprints = useSprints();
  const deleteSprint = useDeleteSprint();
  const users = useUsers();
  const initialSprintId = searchParams.get("sprint") ?? undefined;
  const [selectedSprintId, setSelectedSprintId] = useState<string | undefined>(initialSprintId);
  const [isCreating, setIsCreating] = useState(!initialSprintId);

  const selectedSprint = useMemo(
    () => sprints.data?.find((sprint) => sprint.id === selectedSprintId),
    [selectedSprintId, sprints.data]
  );

  useEffect(() => {
    if (!sprints.data || isCreating) {
      return;
    }

    const selectedExists = sprints.data.some((sprint) => sprint.id === selectedSprintId);
    if (!selectedExists && sprints.data.length) {
      setSelectedSprintId(sprints.data[0].id);
      setSearchParams({ sprint: sprints.data[0].id });
    }
  }, [isCreating, selectedSprintId, setSearchParams, sprints.data]);

  const updateSelectedSprint = (id: string) => {
    setIsCreating(false);
    setSelectedSprintId(id);
    setSearchParams({ sprint: id });
  };

  const startNewSprint = () => {
    setIsCreating(true);
    setSelectedSprintId(undefined);
    setSearchParams({});
  };

  const handleDeleteSprint = () => {
    if (!selectedSprint || deleteSprint.isLoading) {
      return;
    }

    const confirmed = window.confirm(`Delete sprint "${selectedSprint.name}"? Tasks in this sprint will move back to the backlog.`);
    if (!confirmed) {
      return;
    }

    deleteSprint.mutate(selectedSprint.id, {
      onSuccess: () => {
        const nextSprint = sprints.data?.find((sprint) => sprint.id !== selectedSprint.id);
        if (nextSprint) {
          updateSelectedSprint(nextSprint.id);
          return;
        }

        startNewSprint();
      }
    });
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Delivery</p>
          <h1>Sprints</h1>
        </div>
        <div className="page-actions">
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
          <button className="secondary-button" type="button" onClick={startNewSprint}>
            <Plus aria-hidden="true" />
            New sprint
          </button>
          <button
            className="secondary-button danger"
            type="button"
            disabled={!selectedSprint || deleteSprint.isLoading}
            onClick={handleDeleteSprint}
          >
            <Trash2 aria-hidden="true" />
            {deleteSprint.isLoading ? "Deleting" : "Delete"}
          </button>
        </div>
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
          <SprintBoard sprintId={selectedSprintId} users={users.data ?? []} />
        </section>
        <aside className="side-panel">
          <SprintForm
            users={users.data ?? []}
            editingSprint={isCreating ? null : selectedSprint}
            onDone={updateSelectedSprint}
          />
          {deleteSprint.isError && <p className="form-error">{getApiErrorMessage(deleteSprint.error)}</p>}
        </aside>
      </div>
    </div>
  );
}
