// File responsibility: Renders and validates the sprint creation and edit form.
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useCreateSprint, useUpdateSprint } from "../../hooks/useSprints";
import type { Project, Sprint, SprintStatus, User } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional()
});

type FormValues = z.infer<typeof schema>;

/**
 * Renders sprint create/edit fields and submits validated sprint data.
 * sprint stores edit defaults; projects/users store selectors; onSaved notifies the parent after mutation success.
 */
export function SprintForm({
  projects,
  users,
  editingSprint,
  hideHeading = false,
  onDone
}: {
  projects: Project[];
  users: User[];
  editingSprint?: Sprint | null;
  hideHeading?: boolean;
  onDone?: (id: string) => void;
}) {
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const projectOptions = useMemo(() => {
    if (!editingSprint || projects.some((project) => project.id === editingSprint.projectId)) {
      return projects;
    }

    return [
      {
        id: editingSprint.projectId,
        userId: editingSprint.userId,
        name: editingSprint.projectName,
        description: null,
        sprintCount: 0,
        createdAt: "",
        updatedAt: ""
      },
      ...projects
    ];
  }, [editingSprint, projects]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      projectId: projects[0]?.id ?? "",
      startDate: "",
      endDate: "",
      status: "PLANNING"
    }
  });

  useEffect(() => {
    form.reset({
      name: editingSprint?.name ?? "",
      description: editingSprint?.description ?? "",
      projectId: editingSprint?.projectId ?? projects[0]?.id ?? "",
      startDate: editingSprint?.startDate ?? "",
      endDate: editingSprint?.endDate ?? "",
      status: (editingSprint?.status ?? "PLANNING") as SprintStatus
    });
    setSelectedUserIds(editingSprint?.participants.map((user) => user.id) ?? []);
  }, [editingSprint, form, projects]);

  const toggleSelectedUser = (userId: string) => {
    if (editingSprint?.userId === userId) {
      return;
    }

    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    const participantIdentifiers = users
      .filter((user) => selectedUserIds.includes(user.id))
      .map((user) => user.username);
    const payload = {
      name: values.name,
      description: values.description || undefined,
      projectId: values.projectId,
      startDate: values.startDate,
      endDate: values.endDate,
      participantIdentifiers
    };

    if (editingSprint) {
      updateSprint.mutate(
        {
          id: editingSprint.id,
          payload: {
            ...payload,
            status: values.status
          }
        },
        {
          onSuccess: (sprint) => onDone?.(sprint.id)
        }
      );
      return;
    }

    createSprint.mutate(payload, {
        onSuccess: (sprint) => {
          form.reset({
            name: "",
            description: "",
            projectId: projects[0]?.id ?? "",
            startDate: "",
            endDate: "",
            status: "PLANNING"
          });
          setSelectedUserIds([]);
          onDone?.(sprint.id);
        }
      }
    );
  });

  const error = createSprint.error || updateSprint.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const isSaving = createSprint.isLoading || updateSprint.isLoading;

  return (
    <form className="panel-form" onSubmit={onSubmit}>
      {!hideHeading && (
        <div className="section-heading">
          <h2>{editingSprint ? "Edit Sprint" : "New Sprint"}</h2>
        </div>
      )}
      <label>
        Name
        <input {...form.register("name")} />
        {form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}
      </label>
      <label>
        Description
        <textarea rows={3} {...form.register("description")} />
      </label>
      <label>
        Project
        <select {...form.register("projectId")}>
          <option value="" disabled>
            Select project
          </option>
          {projectOptions.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {form.formState.errors.projectId && <small>{form.formState.errors.projectId.message}</small>}
        {projectOptions.length === 0 && <small>Create a project before adding sprints.</small>}
      </label>
      <div className="form-grid">
        <label>
          Start
          <input type="date" {...form.register("startDate")} />
        </label>
        <label>
          End
          <input type="date" {...form.register("endDate")} />
        </label>
      </div>
      {editingSprint && (
        <label>
          Status
          <select {...form.register("status")}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      )}
      <label>
        Members
        <div className="member-picker">
          {users.map((user) => {
            const isOwner = editingSprint?.userId === user.id;
            return (
              <label className="member-option" key={user.id}>
                <input
                  type="checkbox"
                  checked={isOwner || selectedUserIds.includes(user.id)}
                  disabled={isOwner}
                  onChange={() => toggleSelectedUser(user.id)}
                />
                <span>
                  <strong>{user.fullName || user.username}</strong>
                  <small>{isOwner ? "Owner" : user.email}</small>
                </span>
              </label>
            );
          })}
          {users.length === 0 && <p className="empty-state">No users available</p>}
        </div>
      </label>
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      <button className="primary-button" type="submit" disabled={isSaving || projectOptions.length === 0}>
        {editingSprint ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {isSaving ? "Saving" : editingSprint ? "Save sprint" : "Create sprint"}
      </button>
    </form>
  );
}
