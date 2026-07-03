import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useCreateTask, useUpdateTask } from "../../hooks/useTasks";
import type { Sprint, Task, TaskPriority } from "../../types";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  sprintId: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function TaskForm({
  sprints,
  editingTask,
  onDone
}: {
  sprints: Sprint[];
  editingTask?: Task | null;
  onDone?: () => void;
}) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      sprintId: ""
    }
  });

  useEffect(() => {
    form.reset({
      title: editingTask?.title ?? "",
      description: editingTask?.description ?? "",
      priority: (editingTask?.priority ?? "MEDIUM") as TaskPriority,
      dueDate: editingTask?.dueDate ?? "",
      sprintId: editingTask?.sprintId ?? ""
    });
  }, [editingTask, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      dueDate: values.dueDate || undefined,
      sprintId: values.sprintId || undefined
    };

    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, payload },
        {
          onSuccess: () => {
            form.reset();
            onDone?.();
          }
        }
      );
      return;
    }

    createTask.mutate(payload, {
      onSuccess: () => {
        form.reset({ title: "", description: "", priority: "MEDIUM", dueDate: "", sprintId: "" });
        onDone?.();
      }
    });
  });

  const error = createTask.error || updateTask.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const isSaving = createTask.isLoading || updateTask.isLoading;

  return (
    <form className="panel-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
      </div>
      <label>
        Title
        <input {...form.register("title")} />
        {form.formState.errors.title && <small>{form.formState.errors.title.message}</small>}
      </label>
      <label>
        Description
        <textarea rows={4} {...form.register("description")} />
      </label>
      <div className="form-grid">
        <label>
          Priority
          <select {...form.register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" {...form.register("dueDate")} />
        </label>
      </div>
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
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      <button className="primary-button" type="submit" disabled={isSaving}>
        {editingTask ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {isSaving ? "Saving" : editingTask ? "Save task" : "Create task"}
      </button>
    </form>
  );
}
