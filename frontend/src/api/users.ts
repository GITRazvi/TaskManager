// File responsibility: Wraps user-management API calls for listing, creating, role updates, and deletion.
import { apiClient, unwrapResponse } from "./client";
import type { User, UserCreateRequest, UserRoleUpdateRequest } from "../types";

/**
 * Loads users visible to the authenticated user.
 */
export function getUsers() {
  return unwrapResponse<User[]>(apiClient.get("/users"));
}

/**
 * Creates a user from the admin form.
 * payload stores username, name, email, password, and role.
 */
export function createUser(payload: UserCreateRequest) {
  return unwrapResponse<User>(apiClient.post("/users", payload));
}

/**
 * Updates a user's role.
 * id stores the target user UUID; payload stores the selected replacement role.
 */
export function updateUserRole(id: string, payload: UserRoleUpdateRequest) {
  return unwrapResponse<User>(apiClient.put(`/users/${id}/role`, payload));
}

/**
 * Deletes a user.
 * id stores the target user UUID selected by an admin.
 */
export function deleteUser(id: string) {
  return unwrapResponse<void>(apiClient.delete(`/users/${id}`));
}
