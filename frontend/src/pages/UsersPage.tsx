// File responsibility: Renders admin user-management workflows for user creation, role changes, and deletion.
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Trash2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { Loading } from "../components/Common/Loading";
import { useCreateUser, useDeleteUser, useUpdateUserRole, useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";
import { canManageUsers, roleLabels } from "../utils/permissions";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  fullName: z.string().max(255).optional(),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER"])
});

type FormValues = z.infer<typeof schema>;

const roles: UserRole[] = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"];

/**
 * Renders admin-only user creation, role editing, and deletion workflows.
 */
export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const users = useUsers();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "DEVELOPER"
    }
  });

  if (!canManageUsers(currentUser)) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = form.handleSubmit((values) => {
    createUser.mutate(
      {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName || undefined,
        role: values.role
      },
      {
        onSuccess: () => form.reset({ username: "", email: "", password: "", fullName: "", role: "DEVELOPER" })
      }
    );
  });

  const error = users.error || createUser.error || updateRole.error || deleteUser.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const isSaving = createUser.isLoading;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Users</h1>
        </div>
      </header>

      <div className="split-layout">
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>User Roles</h2>
              <p>{users.data ? `${users.data.length} active users` : "Loading users"}</p>
            </div>
          </div>
          {users.isLoading && <Loading label="Loading users" />}
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="user-list">
            {users.data?.map((user) => (
              <article className="user-row" key={user.id}>
                <div className="user-row-main">
                  <strong>{user.fullName || user.username}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="user-row-actions">
                  <select
                    aria-label={`Role for ${user.username}`}
                    value={user.role}
                    disabled={user.id === currentUser?.id || updateRole.isLoading}
                    onChange={(event) =>
                      updateRole.mutate({ id: user.id, payload: { role: event.target.value as UserRole } })
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                  <button
                    className="icon-button danger"
                    type="button"
                    disabled={user.id === currentUser?.id || deleteUser.isLoading}
                    onClick={() => {
                      if (window.confirm(`Delete user "${user.username}"?`)) {
                        deleteUser.mutate(user.id);
                      }
                    }}
                    aria-label={`Delete ${user.username}`}
                    title="Delete user"
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
            {users.data?.length === 0 && <p className="empty-state">No active users.</p>}
          </div>
        </section>

        <aside className="side-panel">
          <div className="panel-header">
            <h2>Create User</h2>
          </div>
          <form className="panel-form" onSubmit={onSubmit}>
            <label>
              Username
              <input {...form.register("username")} />
              {form.formState.errors.username && <small>{form.formState.errors.username.message}</small>}
            </label>
            <label>
              Email
              <input type="email" {...form.register("email")} />
              {form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}
            </label>
            <label>
              Password
              <input type="password" {...form.register("password")} />
              {form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}
            </label>
            <label>
              Full name
              <input {...form.register("fullName")} />
            </label>
            <label>
              Role
              <select {...form.register("role")}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? <Save aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
              {isSaving ? "Saving" : "Create user"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
