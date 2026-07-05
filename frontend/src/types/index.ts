export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface Task {
  id: string;
  userId: string;
  sprintId?: string | null;
  assignedToId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: TaskPriority | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponse {
  tasks: Task[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  sprintId?: string;
  assignedToId?: string;
}

export type TaskUpdateRequest = Partial<TaskCreateRequest & { status: TaskStatus }>;

export interface Sprint {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  taskCount: number;
  participants: User[];
  createdAt: string;
  updatedAt: string;
}

export interface SprintCreateRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  participantIdentifiers?: string[];
}

export type SprintUpdateRequest = Partial<SprintCreateRequest & { status: SprintStatus }>;

export interface SprintBoardResponse {
  sprintId: string;
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

export interface SprintStatsResponse {
  sprintId: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  velocity: number;
  tasksByPriority: Partial<Record<TaskPriority, number>>;
}
