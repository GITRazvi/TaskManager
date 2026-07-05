import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useCreateSprint, useUpdateSprint } from "../../hooks/useSprints";
import type { Sprint, SprintStatus, User } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional()
});

type FormValues = z.infer<typeof schema>;

export function SprintForm({
  users,
  editingSprint,
  onDone
}: {
  users: User[];
  editingSprint?: Sprint | null;
  onDone?: (id: string) => void;
}) {
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", status: "PLANNING" }
  });

  useEffect(() => {
    form.reset({
      name: editingSprint?.name ?? "",
      description: editingSprint?.description ?? "",
      startDate: editingSprint?.startDate ?? "",
      endDate: editingSprint?.endDate ?? "",
      status: (editingSprint?.status ?? "PLANNING") as SprintStatus
    });
    setSelectedUserIds(editingSprint?.participants.map((user) => user.id) ?? []);
  }, [editingSprint, form]);

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
          form.reset({ name: "", description: "", startDate: "", endDate: "", status: "PLANNING" });
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
      <div className="section-heading">
        <h2>{editingSprint ? "Edit Sprint" : "New Sprint"}</h2>
      </div>
      <label>
        Name
        <input {...form.register("name")} />
        {form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}
      </label>
      <label>
        Description
        <textarea rows={3} {...form.register("description")} />
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
      <button className="primary-button" type="submit" disabled={isSaving}>
        {editingSprint ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {isSaving ? "Saving" : editingSprint ? "Save sprint" : "Create sprint"}
      </button>
    </form>
  );
}
