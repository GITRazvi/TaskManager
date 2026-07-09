// File responsibility: Defines shared frontend domain types and API payload contracts.
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type UserRole = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

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
  role: UserRole;
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

export interface UserCreateRequest extends RegisterRequest {
  role: UserRole;
}

export interface UserRoleUpdateRequest {
  role: UserRole;
}

export interface Task {
  id: string;
  userId: string;
  sprintId?: string | null;
  assignedToId?: string | null;
  reviewerId?: string | null;
  projectId?: string | null;
  sprintName?: string | null;
  projectName?: string | null;
  title: string;
  description?: string | null;
  comments: TaskComment[];
  statusHistory: TaskStatusHistory[];
  status: TaskStatus;
  priority?: TaskPriority | null;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId?: string | null;
  authorName?: string | null;
  content: string;
  attachmentFileName?: string | null;
  attachmentContentType?: string | null;
  attachmentSize?: number | null;
  attachmentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatusHistory {
  id?: string | null;
  taskId: string;
  fromStatus?: TaskStatus | null;
  toStatus: TaskStatus;
  changedById?: string | null;
  changedByName?: string | null;
  createdAt: string;
}

export interface TaskListResponse {
  tasks: Task[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TaskStatsResponse {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  totalStoryPoints: number;
  overdueTasks: number;
  tasksByStatus: Partial<Record<TaskStatus, number>>;
  tasksByPriority: Partial<Record<TaskPriority, number>>;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
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
  reviewerId?: string;
  storyPoints?: number;
  estimatedHours?: number;
  comments?: string;
}

export type TaskUpdateRequest = Partial<TaskCreateRequest & { status: TaskStatus }>;

export interface TaskCommentCreateRequest {
  content?: string;
  attachment?: File;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  sprintCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
}

export type ProjectUpdateRequest = Partial<ProjectCreateRequest>;

export interface Sprint {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  creatorName: string;
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
  projectId: string;
  startDate: string;
  endDate: string;
  participantIdentifiers?: string[];
}

export type SprintUpdateRequest = Partial<SprintCreateRequest & { status: SprintStatus }>;

export interface SprintBoardResponse {
  sprintId: string;
  todo: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}

export interface SprintStatsResponse {
  sprintId: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  velocity: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  totalStoryPoints: number;
  overdueTasks: number;
  tasksByPriority: Partial<Record<TaskPriority, number>>;
}
