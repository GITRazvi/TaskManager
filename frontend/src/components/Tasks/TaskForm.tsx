// File responsibility: Renders and validates the task creation and edit form.
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useCreateTask, useUpdateTask } from "../../hooks/useTasks";
import { useAuthStore } from "../../store/authStore";
import type { Project, ProjectRole, Sprint, Task, TaskPriority, User } from "../../types";
import { canAssignTaskToForRole, canSetTaskMetadataForRole, getRoleForSprint } from "../../utils/permissions";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  sprintId: z.string().optional(),
  assignedToId: z.string().optional(),
  reviewerId: z.string().optional(),
  storyPoints: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+$/.test(value), "Story points must be a whole number"),
  estimatedHours: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), "Hours must be 0 or higher"),
  comments: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

/**
 * Renders task create/edit inputs and submits validated values.
 * task stores edit defaults when present; users/sprints store selector options; onSaved notifies the parent after success.
 */
export function TaskForm({
  sprints,
  projects = [],
  users,
  editingTask,
  defaultSprintId = "",
  lockSprint = false,
  hideHeading = false,
  onDone
}: {
  sprints: Sprint[];
  projects?: Project[];
  users: User[];
  editingTask?: Task | null;
  defaultSprintId?: string;
  lockSprint?: boolean;
  hideHeading?: boolean;
  onDone?: () => void;
}) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const currentUser = useAuthStore((state) => state.user);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      sprintId: defaultSprintId,
      assignedToId: "",
      reviewerId: "",
      storyPoints: "",
      estimatedHours: "",
      comments: ""
    }
  });
  const selectedSprintId = form.watch("sprintId");
  const selectedSprint = useMemo(
    () => sprints.find((sprint) => sprint.id === selectedSprintId),
    [selectedSprintId, sprints]
  );
  const selectedRole: ProjectRole | null = selectedSprint
    ? getRoleForSprint(selectedSprint, projects)
    : "DEVELOPER";
  const canSetMetadata = canSetTaskMetadataForRole(selectedRole);
  const reviewerOptions = selectedSprint?.participants?.length ? selectedSprint.participants : users;
  const assigneeOptions = users.filter((user) => canAssignTaskToForRole(selectedRole, currentUser?.id, user.id));

  useEffect(() => {
    form.reset({
      title: editingTask?.title ?? "",
      description: editingTask?.description ?? "",
      priority: (editingTask?.priority ?? "MEDIUM") as TaskPriority,
      dueDate: editingTask?.dueDate ?? "",
      sprintId: editingTask?.sprintId ?? defaultSprintId,
      assignedToId: editingTask?.assignedToId ?? "",
      reviewerId: editingTask?.reviewerId ?? "",
      storyPoints: editingTask?.storyPoints == null ? "" : String(editingTask.storyPoints),
      estimatedHours: editingTask?.estimatedHours == null ? "" : String(editingTask.estimatedHours),
      comments: ""
    });
  }, [defaultSprintId, editingTask, form]);

  useEffect(() => {
    const reviewerId = form.getValues("reviewerId");
    if (!reviewerId || reviewerOptions.some((user) => user.id === reviewerId)) {
      return;
    }

    form.setValue("reviewerId", "");
  }, [form, reviewerOptions]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      dueDate: values.dueDate || undefined,
      sprintId: values.sprintId || undefined,
      comments: values.comments || undefined
    };
    const metadata = canSetMetadata
      ? {
          priority: values.priority,
          assignedToId: values.assignedToId || undefined,
          reviewerId: values.reviewerId || undefined,
          storyPoints: values.storyPoints ? Number(values.storyPoints) : undefined,
          estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : undefined
        }
      : {
          assignedToId: values.assignedToId || undefined
        };

    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, payload: { ...payload, ...metadata } },
        {
          onSuccess: () => {
            form.reset();
            onDone?.();
          }
        }
      );
      return;
    }

    createTask.mutate({ ...payload, ...metadata }, {
      onSuccess: () => {
        form.reset({
          title: "",
          description: "",
          priority: "MEDIUM",
          dueDate: "",
          sprintId: defaultSprintId,
          assignedToId: "",
          reviewerId: "",
          storyPoints: "",
          estimatedHours: "",
          comments: ""
        });
        onDone?.();
      }
    });
  });

  const error = createTask.error || updateTask.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const isSaving = createTask.isLoading || updateTask.isLoading;

  return (
    <form className="panel-form" onSubmit={onSubmit}>
      {!hideHeading && (
        <div className="section-heading">
          <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
        </div>
      )}
      <label>
        Title
        <input {...form.register("title")} />
        {form.formState.errors.title && <small>{form.formState.errors.title.message}</small>}
      </label>
      <label>
        Description
        <textarea rows={4} {...form.register("description")} />
      </label>
      <label>
        {editingTask ? "New comment" : "Initial comment"}
        <textarea rows={3} {...form.register("comments")} />
      </label>
      <div className="form-grid">
        {canSetMetadata && (
          <label>
            Priority
            <select {...form.register("priority")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
        )}
        <label>
          Due date
          <input type="date" {...form.register("dueDate")} />
        </label>
      </div>
      {canSetMetadata && (
        <>
          <label>
            Story points
            <input min="0" step="1" type="number" {...form.register("storyPoints")} />
            {form.formState.errors.storyPoints && <small>{form.formState.errors.storyPoints.message}</small>}
          </label>
          <label>
            Estimated hours
            <input min="0" step="0.25" type="number" {...form.register("estimatedHours")} />
            {form.formState.errors.estimatedHours && <small>{form.formState.errors.estimatedHours.message}</small>}
          </label>
        </>
      )}
      {lockSprint ? (
        <input type="hidden" {...form.register("sprintId")} />
      ) : (
        <label>
          Sprint
          <select {...form.register("sprintId")}>
            <option value="">Backlog</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Assignee
        <select {...form.register("assignedToId")}>
          <option value="">Unassigned</option>
          {assigneeOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName || user.username}
            </option>
          ))}
        </select>
      </label>
      {canSetMetadata && (
        <label>
          Reviewer
          <select {...form.register("reviewerId")}>
            <option value="">No reviewer</option>
            {reviewerOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.username}
              </option>
            ))}
          </select>
        </label>
      )}
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      <button className="primary-button" type="submit" disabled={isSaving}>
        {editingTask ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {isSaving ? "Saving" : editingTask ? "Save task" : "Create task"}
      </button>
    </form>
  );
}
