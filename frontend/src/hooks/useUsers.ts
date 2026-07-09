// File responsibility: Provides React Query hooks and cache updates for user-management workflows.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../api/users";
import type { User, UserCreateRequest, UserRoleUpdateRequest } from "../types";

/**
 * Fetches the user list used by admin pages, assignee selectors, reviewer selectors, and mentions.
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
    staleTime: 1000 * 60 * 5
  });
}

/**
 * Inserts or replaces one user in a cached user list.
 * users stores the current cache value; user stores the latest server version.
 */
function upsertUser(users: User[] | undefined, user: User) {
  if (!users) {
    return [user];
  }
  return users.some((current) => current.id === user.id)
    ? users.map((current) => (current.id === user.id ? user : current))
    : [...users, user];
}

/**
 * Creates a user and writes the returned user into the cached list.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCreateRequest) => usersApi.createUser(payload),
    onSuccess: (user) => {
      queryClient.setQueryData<User[]>(["users"], (users) => upsertUser(users, user));
    }
  });
}

/**
 * Updates a user's role.
 * The mutation input stores the target user id and the selected replacement role payload.
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserRoleUpdateRequest }) =>
      usersApi.updateUserRole(id, payload),
    onSuccess: (user) => {
      queryClient.setQueryData<User[]>(["users"], (users) => upsertUser(users, user));
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });
}

/**
 * Deletes a user and removes that id from the cached list.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<User[]>(["users"], (users) => users?.filter((user) => user.id !== id));
    }
  });
}
