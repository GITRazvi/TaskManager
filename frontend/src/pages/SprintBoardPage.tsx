import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { SprintBoard } from "../components/Sprints/SprintBoard";
import { SprintForm } from "../components/Sprints/SprintForm";
import { SprintStats } from "../components/Sprints/SprintStats";
import { TaskForm } from "../components/Tasks/TaskForm";
import { useProjects } from "../hooks/useProjects";
import { useDeleteSprint, useSprints } from "../hooks/useSprints";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";

type PanelMode = "sprint" | "edit" | "task" | null;

export function SprintBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sprints = useSprints();
  const projects = useProjects();
  const deleteSprint = useDeleteSprint();
  const users = useUsers();
  const currentUser = useAuthStore((state) => state.user);
  const initialSprintId = searchParams.get("sprint") ?? undefined;
  const [selectedSprintId, setSelectedSprintId] = useState<string | undefined>(initialSprintId);
  const [activePanel, setActivePanel] = useState<PanelMode>(initialSprintId ? null : "sprint");

  const selectedSprint = useMemo(
    () => sprints.data?.find((sprint) => sprint.id === selectedSprintId),
    [selectedSprintId, sprints.data]
  );
  const isSprintOwner = Boolean(selectedSprint && currentUser?.id === selectedSprint.userId);

  useEffect(() => {
    if (!sprints.data || sprints.isFetching || activePanel === "sprint") {
      return;
    }

    const selectedExists = sprints.data.some((sprint) => sprint.id === selectedSprintId);
    if (!selectedExists && sprints.data.length) {
      setSelectedSprintId(sprints.data[0].id);
      setSearchParams({ sprint: sprints.data[0].id });
    }
  }, [activePanel, selectedSprintId, setSearchParams, sprints.data, sprints.isFetching]);

  const updateSelectedSprint = (id: string) => {
    setActivePanel(null);
    setSelectedSprintId(id);
    setSearchParams({ sprint: id });
  };

  const startNewSprint = () => {
    setActivePanel("sprint");
    setSelectedSprintId(undefined);
    setSearchParams({});
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleDeleteSprint = () => {
    if (!selectedSprint || deleteSprint.isLoading) {
      return;
    }

    const confirmed = window.confirm(
      `Delete sprint "${selectedSprint.name}"? Tasks in this sprint will move back to the backlog.`
    );
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
            Create sprint
          </button>
          {isSprintOwner && (
            <button
              className="secondary-button danger"
              type="button"
              disabled={!selectedSprint || deleteSprint.isLoading}
              onClick={handleDeleteSprint}
            >
              <Trash2 aria-hidden="true" />
              {deleteSprint.isLoading ? "Deleting" : "Delete"}
            </button>
          )}
        </div>
      </header>

      <div className={`split-layout${activePanel ? "" : " split-layout-full"}`}>
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>{selectedSprint?.name ?? "Sprint Board"}</h2>
              <p>
                {selectedSprint
                  ? `${selectedSprint.projectName} - ${selectedSprint.status} - ${selectedSprint.taskCount} tasks - Created by ${selectedSprint.creatorName}`
                  : "No sprint selected"}
              </p>
            </div>
            <div className="section-actions">
              <button
                className="icon-button"
                type="button"
                disabled={!selectedSprint}
                onClick={() => setActivePanel("task")}
                aria-label="Create task in selected sprint"
                title="Create task"
              >
                <Plus aria-hidden="true" />
              </button>
              <button
                className="icon-button"
                type="button"
                disabled={!isSprintOwner}
                onClick={() => {
                  if (isSprintOwner) {
                    setActivePanel("edit");
                  }
                }}
                aria-label="Edit selected sprint"
                title="Edit sprint"
              >
                <Pencil aria-hidden="true" />
              </button>
            </div>
          </div>
          <SprintStats sprintId={selectedSprintId} />
          <SprintBoard sprintId={selectedSprintId} sprint={selectedSprint} users={users.data ?? []} />
        </section>
        {activePanel && (
          <aside className="side-panel">
            <div className="panel-header">
              <h2>{activePanel === "task" ? "Add Task" : activePanel === "edit" ? "Edit Sprint" : "Create Sprint"}</h2>
              <button className="icon-button" type="button" onClick={closePanel} aria-label="Close panel">
                <X aria-hidden="true" />
              </button>
            </div>
            {activePanel === "task" ? (
              <TaskForm
                key={selectedSprintId}
                sprints={sprints.data ?? []}
                users={users.data ?? []}
                defaultSprintId={selectedSprintId}
                lockSprint
                hideHeading
                onDone={closePanel}
              />
            ) : (
              <SprintForm
                projects={projects.data ?? []}
                users={users.data ?? []}
                editingSprint={activePanel === "edit" ? selectedSprint : null}
                hideHeading
                onDone={updateSelectedSprint}
              />
            )}
            {deleteSprint.isError && <p className="form-error">{getApiErrorMessage(deleteSprint.error)}</p>}
          </aside>
        )}
      </div>
    </div>
  );
}
