// File responsibility: Renders project management workflows for listing, creating, editing, and deleting projects.
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban, Pencil, Plus, Save, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { Loading } from "../components/Common/Loading";
import {
  useAddProjectMember,
  useCreateProject,
  useDeleteProject,
  useProjects,
  useRemoveProjectMember,
  useUpdateProject,
  useUpdateProjectMemberRole
} from "../hooks/useProjects";
import { useUsers } from "../hooks/useUsers";
import type { Project, ProjectRole } from "../types";
import { canManageProject, projectRoles, roleLabels } from "../utils/permissions";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional()
});
const memberSchema = z.object({
  userIdentifier: z.string().min(1, "Select a user"),
  role: z.enum(["PROJECT_MANAGER", "DEVELOPER", "QA_TESTER", "PRODUCT_OWNER", "SCRUM_MASTER", "VIEWER"])
});

type ProjectFormValues = z.infer<typeof projectSchema>;
type MemberFormValues = z.infer<typeof memberSchema>;

/**
 * Renders project CRUD controls and honors dashboard links to a specific project.
 * linkedProjectId stores the optional query-param project id used to open a project for editing.
 */
export function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const projects = useProjects();
  const users = useUsers();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addMember = useAddProjectMember();
  const updateMemberRole = useUpdateProjectMemberRole();
  const removeMember = useRemoveProjectMember();
  const linkedProjectId = searchParams.get("project");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "" }
  });
  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { userIdentifier: "", role: "DEVELOPER" }
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

  useEffect(() => {
    if (!editingProject || !projects.data) {
      return;
    }
    const latestProject = projects.data.find((project) => project.id === editingProject.id);
    if (latestProject && latestProject !== editingProject) {
      setEditingProject(latestProject);
    }
  }, [editingProject, projects.data]);

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

  const onAddMember = memberForm.handleSubmit((values) => {
    if (!editingProject) {
      return;
    }

    addMember.mutate(
      {
        projectId: editingProject.id,
        payload: {
          userIdentifier: values.userIdentifier,
          role: values.role
        }
      },
      {
        onSuccess: () => memberForm.reset({ userIdentifier: "", role: "DEVELOPER" })
      }
    );
  });

  const handleDeleteProject = (project: Project) => {
    if (deleteProject.isLoading) {
      return;
    }
    if (window.confirm(`Delete project "${project.name}"? Sprints in this project must be removed first.`)) {
      deleteProject.mutate(project.id, {
        onSuccess: () => {
          if (editingProject?.id === project.id) {
            clearEdit();
          }
        }
      });
    }
  };

  const error =
    createProject.error ||
    updateProject.error ||
    deleteProject.error ||
    addMember.error ||
    updateMemberRole.error ||
    removeMember.error ||
    projects.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const isSaving =
    createProject.isLoading ||
    updateProject.isLoading ||
    deleteProject.isLoading ||
    addMember.isLoading ||
    updateMemberRole.isLoading ||
    removeMember.isLoading;
  const canManageSelectedProject = canManageProject(editingProject);
  const availableUsers =
    users.data?.filter((user) => !editingProject?.members.some((member) => member.userId === user.id)) ?? [];

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
                  {project.role && <span className="role-chip">{roleLabels[project.role]}</span>}
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => setEditingProject(project)}
                    aria-label={`Edit ${project.name}`}
                    title="Edit project"
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  {canManageProject(project) && (
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDeleteProject(project)}
                      aria-label={`Delete ${project.name}`}
                      title="Delete project"
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  )}
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
          {editingProject && (
            <section className="profile-list-section">
              <div className="section-heading">
                <div>
                  <h2>Members</h2>
                  <p>{editingProject.members.length} assigned roles</p>
                </div>
              </div>
              {canManageSelectedProject && (
                <form className="panel-form" onSubmit={onAddMember}>
                  <label>
                    User
                    <input list="project-users" {...memberForm.register("userIdentifier")} />
                    <datalist id="project-users">
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.username}>
                          {user.fullName || user.email}
                        </option>
                      ))}
                    </datalist>
                    {memberForm.formState.errors.userIdentifier && (
                      <small>{memberForm.formState.errors.userIdentifier.message}</small>
                    )}
                  </label>
                  <label>
                    Role
                    <select {...memberForm.register("role")}>
                      {projectRoles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button" type="submit" disabled={isSaving}>
                    <UserPlus aria-hidden="true" />
                    Add member
                  </button>
                </form>
              )}
              <div className="user-list">
                {editingProject.members.map((member) => (
                  <article className="user-row" key={member.id}>
                    <div className="user-row-main">
                      <strong>{member.fullName || member.username}</strong>
                      <span>{member.email}</span>
                    </div>
                    <div className="user-row-actions">
                      <select
                        aria-label={`Role for ${member.username}`}
                        value={member.role}
                        disabled={!canManageSelectedProject || isSaving}
                        onChange={(event) =>
                          updateMemberRole.mutate({
                            projectId: editingProject.id,
                            memberId: member.id,
                            payload: { role: event.target.value as ProjectRole }
                          })
                        }
                      >
                        {projectRoles.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                      {canManageSelectedProject && (
                        <button
                          className="icon-button danger"
                          type="button"
                          disabled={isSaving}
                          onClick={() => removeMember.mutate({ projectId: editingProject.id, memberId: member.id })}
                          aria-label={`Remove ${member.username}`}
                          title="Remove member"
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
