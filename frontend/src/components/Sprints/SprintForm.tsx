import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useCreateSprint } from "../../hooks/useSprints";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required")
});

type FormValues = z.infer<typeof schema>;

export function SprintForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const createSprint = useCreateSprint();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "" }
  });

  const onSubmit = form.handleSubmit((values) => {
    createSprint.mutate(
      { ...values, description: values.description || undefined },
      {
        onSuccess: (sprint) => {
          form.reset();
          onCreated?.(sprint.id);
        }
      }
    );
  });

  return (
    <form className="panel-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <h2>New Sprint</h2>
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
      {createSprint.isError && <p className="form-error">{getApiErrorMessage(createSprint.error)}</p>}
      <button className="primary-button" type="submit" disabled={createSprint.isLoading}>
        <Plus aria-hidden="true" />
        {createSprint.isLoading ? "Creating" : "Create sprint"}
      </button>
    </form>
  );
}
