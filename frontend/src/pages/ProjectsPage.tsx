import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban, Pencil, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { Loading } from "../components/Common/Loading";
import { useCreateProject, useProjects, useUpdateProject } from "../hooks/useProjects";
import type { Project } from "../types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const projects = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const linkedProjectId = searchParams.get("project");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" }
  });

  useEffect(() => {
    form.reset({
      name: editingProject?.name ?? "",
      description: editingProject?.description ?? ""
    });
  }, [editingProject, form]);

  useEffect(() => {
    if (!linkedProjectId || !projects.data) {
      return;
    }

    const linkedProject = projects.data.find((project) => project.id === linkedProjectId);
    if (linkedProject) {
      setEditingProject(linkedProject);
    }
  }, [linkedProjectId, projects.data]);

  const clearEdit = () => {
    setEditingProject(null);
    form.reset({ name: "", description: "" });
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined
    };

    if (editingProject) {
      updateProject.mutate(
        { id: editingProject.id, payload },
        {
          onSuccess: clearEdit
        }
      );
      return;
    }

    createProject.mutate(payload, {
      onSuccess: () => form.reset({ name: "", description: "" })
    });
  });

  const error = createProject.error || updateProject.error || projects.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const isSaving = createProject.isLoading || updateProject.isLoading;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1>Projects</h1>
        </div>
      </header>

      <div className="split-layout">
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Project List</h2>
              <p>{projects.data ? `${projects.data.length} projects` : "Loading projects"}</p>
            </div>
          </div>
          {projects.isLoading && <Loading label="Loading projects" />}
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="project-list">
            {projects.data?.map((project) => (
              <article
                className={`project-row${project.id === linkedProjectId ? " project-row-linked" : ""}`}
                key={project.id}
              >
                <div className="project-row-main">
                  <FolderKanban aria-hidden="true" />
                  <div>
                    <h2>{project.name}</h2>
                    <p>{project.description || "No description"}</p>
                  </div>
                </div>
                <div className="project-row-actions">
                  <span>{project.sprintCount} sprints</span>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => setEditingProject(project)}
                    aria-label={`Edit ${project.name}`}
                    title="Edit project"
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
            {projects.data?.length === 0 && <p className="empty-state">No projects yet.</p>}
          </div>
        </section>

        <aside className="side-panel">
          <div className="panel-header">
            <h2>{editingProject ? "Edit Project" : "Create Project"}</h2>
            {editingProject && (
              <button className="icon-button" type="button" onClick={clearEdit} aria-label="Cancel edit">
                <X aria-hidden="true" />
              </button>
            )}
          </div>
          <form className="panel-form" onSubmit={onSubmit}>
            <label>
              Name
              <input {...form.register("name")} />
              {form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}
            </label>
            <label>
              Description
              <textarea rows={4} {...form.register("description")} />
            </label>
            <button className="primary-button" type="submit" disabled={isSaving}>
              {editingProject ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
              {isSaving ? "Saving" : editingProject ? "Save project" : "Create project"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
