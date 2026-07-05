import { apiClient, unwrapResponse } from "./client";
import type { User } from "../types";

export function getUsers() {
  return unwrapResponse<User[]>(apiClient.get("/users"));
}
