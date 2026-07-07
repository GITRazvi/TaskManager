<!-- File responsibility: Captures the overall project roadmap, architecture direction, and implementation milestones. -->
# Full-Stack Task Manager (Java/React) - Scrum-Style Development Plan

**Project Name:** Task Manager  
**Start Date:** 2026-07-03  
**Duration:** 8 weeks (4 sprints)  
**Status:** In Implementation

---

## Executive Summary

A complete Task Manager application built with **Spring Boot 3 backend** (Java 21, JWT authentication, PostgreSQL) and **React (TypeScript) frontend**, organized into **4 development sprints**. The application follows Scrum-style development practices with sprint phases, user stories, and sprint planning. Deployment infrastructure includes Docker containerization and GitHub Actions CI/CD pipeline.

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Runtime environment |
| Spring Boot | 3.x | Framework |
| Spring Web | 3.x | REST API |
| Spring Security | 6.x | JWT Authentication |
| Spring Data JPA | 3.x | ORM/Data access |
| Hibernate | 6.x | ORM implementation |
| PostgreSQL | 14+ | Primary database |
| Flyway | 9.x | Database migrations |
| Lombok | 1.18.x | Reduce boilerplate |
| Bean Validation | 3.x | Input validation |
| Jackson | 2.x | JSON serialization |
| JUnit 5 | 5.x | Testing |
| Mockito | 5.x | Mocking in tests |
| Maven | 3.8+ | Build tool |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 4.x | Build tool |
| React Router | 6.x | Navigation |
| TanStack Query | 4.x | Server state management |
| Axios | 1.x | HTTP client |
| Zustand | 4.x | Client state (optional) |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| Tailwind CSS | 3.x | Styling |
| Vitest | 1.x+ | Unit testing |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local development orchestration |
| GitHub Actions | CI/CD pipeline |
| PostgreSQL Docker | Database container |
| Nginx | Reverse proxy for frontend |

---

## Feature Scope

### User Stories (MVP - Sprints 1-3)

#### Authentication & User Management (Sprint 1)
- **US-001:** User can register with email and password
  - Acceptance Criteria: Password min 8 chars, uppercase, lowercase, number, special char; Email validation; Duplicate email check
- **US-002:** User can log in and receive JWT token
  - Acceptance Criteria: Credentials validated; JWT token returned; Token contains user ID and email
- **US-003:** User can refresh JWT tokens
  - Acceptance Criteria: Refresh token extends session; Old token invalidated; Returns new access token
- **US-004:** User can log out
  - Acceptance Criteria: Tokens removed from frontend; Backend invalidates the refresh token; Protected routes redirect to login
- **US-005:** User can manage profile
  - Acceptance Criteria: View profile info; Update full name and avatar; Password change endpoint

#### Task Management (Sprint 2)
- **US-010:** User can create a task
  - Acceptance Criteria: Title (required), description, priority (Low/Medium/High/Critical), due date (optional); Task assigned to logged-in user; Returns 201 Created
- **US-011:** User can view all their tasks
  - Acceptance Criteria: Paginated list; Only user's own tasks returned; Includes task details
- **US-012:** User can filter tasks
  - Acceptance Criteria: By status (TODO/IN_PROGRESS/DONE); By priority; By due date range; Combine filters
- **US-013:** User can update task details
  - Acceptance Criteria: Any field can be updated; Permission check (only task owner); Returns 200 OK
- **US-014:** User can delete a task
  - Acceptance Criteria: Task is hard deleted; Only task owner can delete; Returns 204 No Content
- **US-015:** User can mark task as complete/incomplete
  - Acceptance Criteria: Toggle status between DONE and TODO; Audit timestamp updated; Front-end reflects change

#### Sprint/Project Organization (Sprint 3)
- **US-019:** User can create and manage projects
  - Acceptance Criteria: Name required; description optional; projects are scoped to the authenticated owner; project list is available in the app.
- **US-020:** User can create a sprint
  - Acceptance Criteria: Name, description, project, start date, end date; Status defaults to PLANNING; Returns sprint ID; sprint is linked to an owned project.
- **US-021:** User can add tasks to a sprint
  - Acceptance Criteria: Assign existing task to sprint; Update task.sprint_id; Only user's own tasks can be added
- **US-022:** User can view sprint board (Kanban)
  - Acceptance Criteria: Three columns: TODO, IN_PROGRESS, DONE; Tasks displayed in respective columns; Sprint filters applied
- **US-023:** User can drag-and-drop tasks between columns
  - Acceptance Criteria: Drop updates task status; Reflects in real-time on board; Change persisted to database
- **US-024:** User can view sprint statistics
  - Acceptance Criteria: Task completion %; Sprint velocity (completed tasks); Tasks by priority chart

---

## Architecture Overview

### Backend Architecture (Layered Pattern)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     REST Controllers (HTTP Layer)   â”‚
â”‚  (AuthController, TaskController)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Service/Business Logic Layer      â”‚
â”‚  (AuthService, TaskService, etc)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Repository/Data Access Layer (JPA) â”‚
â”‚  (UserRepository, TaskRepository)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      Entities/Domain Models         â”‚
â”‚   (User, Task, Sprint entities)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      PostgreSQL Database            â”‚
â”‚    (Normalized relational schema)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Security Architecture (JWT Flow)

```
User Login Request
    â†“
AuthController.login()
    â†“
AuthService validates credentials (BCrypt)
    â†“
JwtTokenProvider generates JWT (+ refresh token)
    â†“
Backend returns tokens to Frontend
    â†“
Frontend stores JWT in localStorage
    â†“
Axios interceptor adds "Authorization: Bearer <token>" to requests
    â†“
JwtAuthenticationFilter extracts & validates JWT
    â†“
SecurityContext populated with user info
    â†“
@PreAuthorize checks permissions (if needed)
    â†“
Controller handles request (if authorized)
```

### Database Schema

#### users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_user_created ON projects(user_id, created_at);
```

#### sprints Table
```sql
CREATE TABLE sprints (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'PLANNING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sprints_user_status ON sprints(user_id, status);
CREATE INDEX idx_sprints_project_status ON sprints(project_id, status);
```

#### tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  sprint_id UUID REFERENCES sprints(id),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'TODO',
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  story_points INTEGER,
  comments TEXT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_sprint_status ON tasks(sprint_id, status);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_reviewer ON tasks(reviewer_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

#### Enums
- **TaskStatus:** TODO, IN_PROGRESS, DONE
- **TaskPriority:** LOW, MEDIUM, HIGH, CRITICAL
- **SprintStatus:** PLANNING, ACTIVE, COMPLETED, ARCHIVED

---

## Backend Architecture Details

### Key Components

#### 1. JWT Authentication & Security
**Location:** `src/main/java/com/taskmanager/security/`

- **JwtTokenProvider:** Generate JWT tokens with claims (user ID, email); Validate token signature; Extract claims; Handle refresh tokens
- **JwtAuthenticationFilter:** Intercept all requests; Extract JWT from Authorization header; Validate token; Set SecurityContext
- **CustomUserDetails:** Implement UserDetails; Store user principal data for authentication context
- **SecurityConfig:** Configure Spring Security; Disable CSRF (stateless API); Configure CORS; Set up JWT filter chain; Permit public endpoints (/api/auth/login, /api/auth/register)

**Key Features:**
- Access token: 15 minute expiration
- Refresh token: 7 day expiration
- HS512 algorithm for JWT signing
- Token stored in `Authorization: Bearer <token>` header

#### 2. Controllers (REST Endpoints)
**Location:** `src/main/java/com/taskmanager/controller/`

**AuthController** (`/api/auth`)
```
POST   /api/auth/register        â†’ Register new user
POST   /api/auth/login           â†’ Login (returns JWT + refresh token)
POST   /api/auth/refresh         â†’ Refresh access token
POST   /api/auth/logout          â†’ Logout (invalidate token)
GET    /api/auth/me              â†’ Get current authenticated user
```

**UserController** (`/api/users`)
```
GET    /api/users/{id}           â†’ Get user profile
PUT    /api/users/{id}           â†’ Update user profile
PUT    /api/users/{id}/password  â†’ Change password
```

**TaskController** (`/api/tasks`)
```
GET    /api/tasks                â†’ List all user tasks (with filters & pagination)
GET    /api/tasks/{id}           â†’ Get task by ID
POST   /api/tasks                â†’ Create new task
PUT    /api/tasks/{id}           â†’ Update task
DELETE /api/tasks/{id}           â†’ Delete task
PATCH  /api/tasks/{id}/status    â†’ Update task status only
```

**ProjectController** (`/api/projects`)
```
GET    /api/projects              -> List user projects
GET    /api/projects/{id}         -> Get project details
POST   /api/projects              -> Create new project
PUT    /api/projects/{id}         -> Update project
```

**SprintController** (`/api/sprints`)
```
GET    /api/sprints              â†’ List all user sprints
GET    /api/sprints/{id}         â†’ Get sprint details
POST   /api/sprints              â†’ Create new sprint
PUT    /api/sprints/{id}         â†’ Update sprint
GET    /api/sprints/{id}/tasks   â†’ Get tasks in sprint grouped by status
GET    /api/sprints/{id}/stats   â†’ Get sprint statistics (completion %, velocity)
```

#### 3. Service Layer (Business Logic)
**Location:** `src/main/java/com/taskmanager/service/`

**AuthService**
- User registration with password validation and hashing
- User login with credential validation
- JWT token generation and refresh
- Token invalidation on logout
- Password reset flow (optional)

**UserService**
- Fetch user profile by ID or email
- Update user information
- Change password (with old password verification)
- Delete user account (soft delete - mark as inactive)

**TaskService**
- Create task with validation (title required, priority enum, due date not in past)
- Fetch tasks with pagination and filtering
- Update task (with permission check - only owner can edit)
- Delete task (hard delete for MVP)
- Change task status
- Calculate task metrics (by priority, by status)

**SprintService**
- Create sprint with required project ownership validation and date validation
- Update sprint (only if not yet completed)
- Add/remove tasks from sprint
- Calculate sprint statistics: completion percentage, velocity (completed tasks in sprint)
- Mark sprint as completed/archived

**ProjectService**
- Create projects for the authenticated user
- List owned projects
- Update project name and description
- Reject project access across users

#### 4. Repository Layer (Spring Data JPA)
**Location:** `src/main/java/com/taskmanager/repository/`

- **UserRepository:** `findByEmail()`, `findByUsername()`, `existsByEmail()`, custom queries for user lookup
- **TaskRepository:** `findAllByUserId()`, `findByIdAndUserId()` (permission check), `findBySprintIdAndStatus()`, `findByUserIdAndStatusAndPriority()`
- **ProjectRepository:** `findAllByUserIdOrderByCreatedAtDesc()`, `findByIdAndUserId()`
- **SprintRepository:** `findAllByUserId()`, `findByIdAndUserId()`, `findAllByUserIdAndStatus()`

**Key Pattern:** Most queries filter by `user_id` to ensure users only see their own data.

#### 5. Entity Models
**Location:** `src/main/java/com/taskmanager/entity/`

- **User:** id, username, email, passwordHash, fullName, avatarUrl, isActive, createdAt, updatedAt
- **Project:** id, userId, name, description, createdAt, updatedAt
- **Sprint:** id, userId, projectId, name, description, startDate, endDate, status, createdAt, updatedAt
- **Task:** id, sprintId, userId, title, description, comments, status, priority, assignedTo, reviewer, storyPoints, dueDate, createdAt, updatedAt

**Annotations:**
- @Entity, @Table
- @Id, @GeneratedValue(strategy = GenerationType.UUID)
- @NotBlank, @Email, @NotNull (validation)
- @Temporal(TemporalType.TIMESTAMP) for date fields
- @CreationTimestamp, @UpdateTimestamp (auto timestamps)
- @ManyToOne, @OneToMany (relationships)
- @JsonIgnore (prevent circular serialization)

#### 6. DTOs (Request/Response)
**Location:** `src/main/java/com/taskmanager/dto/`

**Auth DTOs**
- `LoginRequest`: email, password
- `RegisterRequest`: email, password, confirmPassword, fullName
- `AuthResponse`: accessToken, refreshToken, userId, email
- `RefreshTokenRequest`: refreshToken

**Task DTOs**
- `TaskCreateRequest`: title, description, comments, priority, dueDate, sprintId, assignedToId, reviewerId, storyPoints
- `TaskUpdateRequest`: title, description, comments, status, priority, dueDate, sprintId, assignedToId, reviewerId, storyPoints
- `TaskResponse`: id, userId, sprintId, assignedToId, reviewerId, projectId, sprintName, projectName, title, description, comments, status, priority, storyPoints, dueDate, createdAt, updatedAt
- `TaskListResponse`: tasks (paginated), totalCount, currentPage, pageSize

**Sprint DTOs**
- `SprintCreateRequest`: name, description, projectId, startDate, endDate
- `SprintResponse`: id, projectId, projectName, name, status, startDate, endDate, taskCount
- `SprintBoardResponse`: sprintId, tasks grouped by status (TODO[], IN_PROGRESS[], DONE[])
- `SprintStatsResponse`: completionPercentage, velocity, tasksByPriority

**Project DTOs**
- `ProjectCreateRequest`: name, description
- `ProjectUpdateRequest`: name, description
- `ProjectResponse`: id, userId, name, description, sprintCount, createdAt, updatedAt

**Generic DTOs**
- `ApiResponse<T>`: success, data, message, timestamp
- `ErrorResponse`: success, error, message, timestamp
- `PaginationParams`: page, size, sortBy, sortDirection

#### 7. Exception Handling
**Location:** `src/main/java/com/taskmanager/exception/`

- **AppException:** Base exception for application errors
- **ResourceNotFoundException:** 404 - User/Task/Sprint not found
- **UnauthorizedException:** 401 - Invalid credentials
- **ForbiddenException:** 403 - User trying to access another user's resource
- **ValidationException:** 400 - Input validation failed
- **GlobalExceptionHandler:** @ControllerAdvice to catch exceptions and return formatted responses with proper HTTP status

**HTTP Status Codes:**
- 200 OK: Successful GET/PUT
- 201 Created: Successful POST (new resource)
- 204 No Content: Successful DELETE
- 400 Bad Request: Validation error
- 401 Unauthorized: Missing/invalid JWT
- 403 Forbidden: User not authorized for resource
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Unexpected error

#### 8. Application Properties
**Location:** `src/main/resources/application.yml`

```yaml
spring:
  application:
    name: TaskManager
  
  datasource:
    url: jdbc:postgresql://localhost:5432/taskmanager_db
    username: taskmanager_user
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

jwt:
  secret: ${JWT_SECRET}
  expiration: 900000
  refresh-expiration: 604800000

logging:
  level:
    root: INFO
    com.taskmanager: DEBUG
```

---

## Frontend Architecture

### Project Structure

```
frontend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts              (Axios instance with JWT interceptor)
â”‚   â”‚   â”œâ”€â”€ auth.ts                (Auth endpoints)
â”‚   â”‚   â”œâ”€â”€ tasks.ts               (Task CRUD endpoints)
â”‚   â”‚   â””â”€â”€ sprints.ts             (Sprint CRUD endpoints)
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ Auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginForm.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterForm.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ProfilePage.tsx
â”‚   â”‚   â”œâ”€â”€ Tasks/
â”‚   â”‚   â”‚   â”œâ”€â”€ TaskList.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ TaskForm.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ TaskCard.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TaskFilters.tsx
â”‚   â”‚   â”œâ”€â”€ Sprints/
â”‚   â”‚   â”‚   â”œâ”€â”€ SprintBoard.tsx     (Kanban board)
â”‚   â”‚   â”‚   â”œâ”€â”€ SprintStats.tsx
â”‚   â”‚   â”‚   â””â”€â”€ SprintForm.tsx
â”‚   â”‚   â”œâ”€â”€ Common/
â”‚   â”‚   â”‚   â”œâ”€â”€ Navigation.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Header.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ErrorBoundary.tsx
â”‚   â”‚   â”‚   â””â”€â”€ Loading.tsx
â”‚   â”‚   â””â”€â”€ Layout/
â”‚   â”‚       â”œâ”€â”€ ProtectedRoute.tsx
â”‚   â”‚       â””â”€â”€ AppLayout.tsx
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts             (Auth context & JWT management)
â”‚   â”‚   â”œâ”€â”€ useTasks.ts            (TanStack Query for tasks)
â”‚   â”‚   â”œâ”€â”€ useSprints.ts          (TanStack Query for sprints)
â”‚   â”‚   â””â”€â”€ useLocalStorage.ts     (Token persistence)
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ LoginPage.tsx
â”‚   â”‚   â”œâ”€â”€ RegisterPage.tsx
â”‚   â”‚   â”œâ”€â”€ DashboardPage.tsx
â”‚   â”‚   â”œâ”€â”€ TasksPage.tsx
â”‚   â”‚   â”œâ”€â”€ SprintBoardPage.tsx
â”‚   â”‚   â””â”€â”€ NotFoundPage.tsx
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â””â”€â”€ authStore.ts           (Zustand - auth state)
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â””â”€â”€ index.ts               (TypeScript interfaces)
â”‚   â”œâ”€â”€ App.tsx                    (Routes setup)
â”‚   â”œâ”€â”€ main.tsx                   (Entry point)
â”‚   â””â”€â”€ index.css
â”œâ”€â”€ public/
â”œâ”€â”€ index.html
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ vite.config.ts
â”œâ”€â”€ vitest.config.ts
â””â”€â”€ .env.example
```

### Key Frontend Patterns

#### Authentication Flow
1. User fills login form (email, password)
2. Call `authApi.login(email, password)` â†’ POST /api/auth/login
3. Receive JWT (accessToken + refreshToken)
4. Store tokens in localStorage and auth context
5. Axios interceptor adds JWT to all subsequent requests
6. If request returns 401, refresh token endpoint called automatically
7. On logout, clear tokens and redirect to login

#### State Management
- **Server State (TanStack Query):** Tasks, sprints, user profile
  - Automatic caching, stale-while-revalidate, pagination
  - `useQuery()` for fetching, `useMutation()` for create/update/delete
- **Client State (Zustand/Context):** Auth status, current user, UI state (modals, notifications)
  - Simple API: `store.setState()`, `store.getState()`
  - Persisted: Save JWT to localStorage

#### Component Patterns
- **Smart Components:** Container components that fetch data (using hooks)
- **Dumb Components:** Pure components that receive props and render
- **Form Components:** React Hook Form + Zod validation, consistent error display
- **Protected Route:** Check authentication before rendering; redirect to login if not authenticated

#### Error Handling
- Global Axios error interceptor: Check status code (401 â†’ logout, 403 â†’ show forbidden, 5xx â†’ show error toast)
- Component-level error boundaries: Catch React errors, display fallback UI
- Form validation: Client-side Zod validation + server-side error messages displayed

---

## Database Migrations (Flyway)

**Location:** `backend/src/main/resources/db/migration/`

### V1__Create_users_table.sql
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### V2__Create_tasks_table.sql
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'TODO',
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### V10__Add_task_review_metadata.sql
```sql
ALTER TABLE tasks
  ADD COLUMN reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN story_points INTEGER CHECK (story_points IS NULL OR story_points >= 0),
  ADD COLUMN comments TEXT;

CREATE INDEX idx_tasks_reviewer ON tasks(reviewer_id);
```

### V3__Create_sprints_table.sql
```sql
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sprints_user_status ON sprints(user_id, status);
```

### V4__Add_sprint_to_tasks.sql
```sql
ALTER TABLE tasks
  ADD COLUMN sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_sprint_status ON tasks(sprint_id, status);
```

### V9__Create_projects_and_link_sprints.sql
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sprints
  ADD COLUMN project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX idx_projects_user_created ON projects(user_id, created_at);
CREATE INDEX idx_sprints_project_status ON sprints(project_id, status);
```

### V5__Create_audit_logs_table.sql
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### V6__Add_indexes.sql
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sprints_created_at ON sprints(created_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

---

## Development Sprints

### Sprint 1: Foundation & Authentication (Weeks 1-2)

**Sprint Goal:** Establish project foundation with user registration/login, JWT authentication, and local development environment.

**User Stories:**
- US-001: User registration with validation
- US-002: User login with JWT token
- US-003: JWT token refresh
- US-004: User logout

**Technical Tasks:**
1. Setup Maven project structure with Spring Boot 3 dependencies
2. Configure PostgreSQL + Flyway migrations
3. Create User entity and database schema (V1__Create_users_table.sql)
4. Implement JwtTokenProvider and SecurityConfig
5. Create AuthController with register/login endpoints
6. Implement UserService with password hashing (BCrypt)
7. Setup global exception handling (@ControllerAdvice)
8. Create AuthRequest/AuthResponse DTOs with validation
9. Write unit tests for AuthService (70%+ coverage)
10. Write integration tests for AuthController
11. Setup React project with TypeScript and Vite
12. Create LoginForm and RegisterForm components
13. Implement Axios client with JWT interceptor
14. Create AuthContext/Zustand store for token management
15. Create ProtectedRoute component
16. Setup Docker Compose with PostgreSQL container
17. Create docker-compose.yml and Dockerfile for backend
18. Document auth flow in API documentation

**Acceptance Criteria:**
- User can register with email validation
- User can login and receive JWT token
- JWT token includes user ID and email claims
- Protected endpoints return 401 if JWT missing/invalid
- Frontend stores JWT in localStorage
- ProtectedRoute redirects unauthenticated users to login
- All endpoints tested (unit + integration)
- Services run in Docker Compose

**Definition of Done:**
- Code reviewed and merged to main
- All tests passing (70%+ coverage)
- Docker Compose runs without errors
- API documentation updated
- README with setup instructions

---

### Sprint 2: Task Management (Weeks 3-4)

**Sprint Goal:** Implement core task CRUD operations with filtering and full REST API.

**User Stories:**
- US-010: Create a task
- US-011: View all tasks with pagination
- US-012: Filter tasks (by status, priority, date)
- US-013: Update task details
- US-014: Delete a task
- US-015: Mark task as complete

**Technical Tasks:**
1. Create Task and TaskStatus enum entities
2. Create database schema (V2__Create_tasks_table.sql)
3. Implement TaskRepository with custom queries
4. Implement TaskService with business logic
5. Create TaskController with full CRUD endpoints
6. Implement task filtering and pagination
7. Add request/response DTOs: TaskCreateRequest, TaskUpdateRequest, TaskResponse
8. Write unit tests for TaskService (75%+ coverage)
9. Write integration tests for TaskController
10. Implement permission checks (only owner can modify task)
11. Create TaskList component with table/card view
12. Create TaskForm component for create/edit
13. Create TaskFilters component for filtering UI
14. Integrate TanStack Query for task fetching and caching
15. Implement optimistic updates for task changes
16. Add form validation with React Hook Form + Zod
17. Create error handling for task operations
18. Setup MSW (Mock Service Worker) for frontend testing
19. Write component tests for TaskList and TaskForm
20. Add loading states and error boundaries

**Acceptance Criteria:**
- POST /api/tasks creates task with validation
- GET /api/tasks returns paginated list filtered by user
- Filter by status/priority/due date works correctly
- PUT /api/tasks/{id} updates task (permission check passes)
- DELETE /api/tasks/{id} deletes task
- Frontend TaskList displays all user tasks
- Frontend can create/edit/delete tasks
- Form validation prevents invalid submissions
- Filtering UI responsive and functional
- TaskService has 75%+ test coverage

**Definition of Done:**
- Code reviewed and merged
- Backend tests passing (75%+ coverage)
- Frontend component tests passing
- TaskController integration tests passing
- UI responsive on mobile and desktop
- Error messages user-friendly

---

### Sprint 3: Sprint/Kanban Board (Weeks 5-6)

**Sprint Goal:** Implement project organization, project-linked sprints, Kanban board view, and drag-and-drop functionality.

**User Stories:**
- US-019: Create and manage projects
- US-020: Create a sprint
- US-021: Add tasks to sprint
- US-022: View sprint board (Kanban)
- US-023: Drag-and-drop tasks between status columns
- US-024: View sprint statistics

**Technical Tasks:**
1. Create Project and Sprint entities and SprintStatus enum
2. Create database schema (V3__Create_sprints_table.sql)
3. Add sprint assignment migration (V4__Add_sprint_to_tasks.sql)
4. Implement ProjectRepository and SprintRepository with ownership/access queries
5. Implement ProjectService and SprintService with calculations
6. Create ProjectController and SprintController with CRUD endpoints
7. Implement sprint statistics calculation (completion %, velocity)
8. Create SprintBoardResponse DTO (tasks grouped by status)
9. Add request/response DTOs: ProjectCreateRequest, ProjectResponse, SprintCreateRequest, SprintResponse, SprintStatsResponse
10. Write unit tests for SprintService (75%+ coverage)
11. Write integration tests for SprintController
12. Create Project page and SprintForm component for create/edit
13. Create SprintBoard component with Kanban layout
14. Implement drag-and-drop using dnd-kit
15. Create TaskCard component (draggable within board)
16. Create SprintStats component with charts (recharts)
17. Integrate TanStack Query for sprint queries
18. Implement real-time board updates after drag-and-drop
19. Add column headers (TODO, IN_PROGRESS, DONE)
20. Display task counts per column
21. Add sprint filtering and assignment in TaskList/TaskForm
22. Write component tests for SprintBoard and TaskCard
23. Implement responsive Kanban (mobile scrollable columns)

**Acceptance Criteria:**
- POST /api/projects creates project
- POST /api/sprints creates sprint only when `projectId` references an owned project
- GET /api/sprints returns user sprints
- GET /api/sprints/{id}/tasks returns Kanban board data
- GET /api/sprints/{id}/stats returns sprint statistics
- SprintBoard displays tasks in 3 columns (TODO, IN_PROGRESS, DONE)
- Drag-and-drop updates task status immediately
- Backend updates task.status after drop
- Sprint statistics calculated correctly
- Kanban responsive on all screen sizes
- SprintService has 75%+ test coverage

**Definition of Done:**
- Code reviewed and merged
- Backend tests passing (75%+ coverage)
- Frontend component tests passing
- SprintController integration tests passing
- Drag-and-drop functional on desktop and mobile
- Sprint statistics visually clear
- No console errors or warnings

---

### Sprint 4: DevOps, Testing & Production Readiness (Weeks 7-8)

**Sprint Goal:** Production-ready application with CI/CD pipeline, comprehensive testing, and deployment infrastructure.

**User Stories:**
- All previous stories considered DONE with acceptance criteria verified
- Non-functional requirements: Performance, security, scalability

**Technical Tasks:**
1. Setup GitHub Actions CI/CD pipeline
2. Create backend test workflow (build, unit tests, integration tests)
3. Create frontend test workflow (build, component tests, lint)
4. Setup SonarQube or similar for code quality (optional)
5. Implement code coverage reporting (JaCoCo backend, Vitest/Istanbul frontend)
6. Setup Docker multi-stage build for backend
7. Create Docker image for React frontend (Nginx)
8. Optimize Docker images for size and performance
9. Create .dockerignore files
10. Performance optimization: Database indexing review
11. Performance optimization: API response time profiling
12. Performance optimization: Frontend code splitting and lazy loading
13. Setup backend logging (SLF4J + Logback)
14. Create structured logging configuration
15. Implement distributed tracing (optional - Micrometer Tracing)
16. Security: CORS configuration review
17. Security: HTTPS support in production config
18. Security: Input sanitization and SQL injection prevention review
19. Security: Password hashing verification (BCrypt strength)
20. Write E2E tests using Playwright or Cypress
21. Create E2E test scenarios: Login â†’ Create Task â†’ Create Sprint â†’ View Board â†’ Edit Task
22. Load testing: Setup JMeter or Locust to simulate 100+ concurrent users
23. Create API documentation (Swagger/OpenAPI with springdoc-openapi)
24. Create user documentation (UI walkthrough, feature guide)
25. Create deployment guide (local, Docker, cloud optional)
26. Create README with setup instructions
27. Final UAT with test scenarios checklist
28. Bug fixes from UAT
29. Database backup/restore procedures
30. Monitoring setup (optional - ELK stack)

**Acceptance Criteria:**
- CI/CD pipeline runs on every push
- Tests execute automatically (fail build on test failure)
- Code coverage: Backend 70%+, Frontend 60%+
- Docker images build without errors
- Docker Compose production-like setup works
- Performance: API endpoints respond in < 500ms (p95)
- Performance: Frontend Lighthouse score > 80
- Load testing: System handles 100 concurrent users without errors
- Security: No vulnerabilities in dependencies (OWASP top 10)
- API documentation complete and accurate
- E2E tests cover 80% of user journeys
- UAT checklist 100% passed

**Definition of Done:**
- Code reviewed and merged
- All tests passing with coverage reports
- CI/CD pipeline green
- Docker builds and runs successfully
- Documentation complete
- UAT approved
- Ready for production deployment (manual or automated)

---

## Project Dependencies (pom.xml Highlights)

```xml
<!-- Spring Boot -->
<spring-boot-starter-web/>
<spring-boot-starter-security/>
<spring-boot-starter-data-jpa/>
<spring-boot-starter-validation/>

<!-- Database -->
<postgresql/>
<flyway-core/>

<!-- JWT & Security -->
<jjwt/> <!-- or io.jsonwebtoken:jjwt -->

<!-- Utilities -->
<lombok/>
<jackson-databind/>

<!-- Testing -->
<spring-boot-starter-test/>
<junit-jupiter/>
<mockito-core/>
<testcontainers-postgresql/>

<!-- Documentation -->
<springdoc-openapi-starter-webmvc-ui/> <!-- Swagger -->
```

---

## Testing Strategy

### Backend Testing

**Unit Testing (Service Layer)**
- Test AuthService: password validation, BCrypt hashing, token generation
- Test TaskService: task creation, validation, filtering, permission checks
- Test SprintService: sprint creation, statistics calculation
- Target: 75% coverage for service classes

**Integration Testing (Controller Layer)**
- Test AuthController endpoints with TestRestTemplate
- Test TaskController CRUD operations with PostgreSQL Testcontainers
- Test SprintController with full database
- Test permission checks (401/403 responses)
- Target: 85% coverage for controller classes

**Tools:** JUnit 5, Mockito, Spring Boot Test, Testcontainers

### Frontend Testing

**Component Testing**
- Test LoginForm: form submission, validation errors
- Test TaskList: render tasks, filtering, pagination
- Test SprintBoard: render columns, drag-and-drop
- Test ProtectedRoute: redirect unauthenticated users

**Integration Testing**
- Setup MSW (Mock Service Worker) for API mocking
- Test complete flows: Login â†’ Create Task â†’ View Task
- Test error scenarios: 400, 401, 500 errors

**E2E Testing**
- Use Playwright or Cypress
- Test: User registration â†’ Login â†’ Create sprint â†’ Add task â†’ Drag task â†’ View stats

**Tools:** Vitest, React Testing Library, MSW, Playwright/Cypress

### Manual Testing
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (iPhone, Android)
- Lighthouse performance audit
- Accessibility audit (WCAG 2.1 AA)

---

## Deployment Architecture

### Local Development (Docker Compose)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: taskmanager_db
      POSTGRES_USER: taskmanager_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/taskmanager_db
      SPRING_DATASOURCE_USERNAME: taskmanager_user
      SPRING_DATASOURCE_PASSWORD: password
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production Deployment (Optional - Cloud)

**Cloud Options:** AWS (EC2 + RDS), GCP (Cloud Run + Cloud SQL), Azure (App Service + Database)

**Infrastructure as Code:** Terraform or CloudFormation for reproducible deployments

**Monitoring:** CloudWatch, DataDog, or ELK stack for logs and metrics

**Backup Strategy:** Automated PostgreSQL backups, disaster recovery plan

---

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] CORS configured only for trusted domains
- [ ] JWT secrets stored in environment variables (not committed)
- [ ] Database passwords in secrets management (not hardcoded)
- [ ] SQL injection prevention (use parameterized queries - JPA does this)
- [ ] XSS prevention (React escapes by default, sanitize if rendering HTML)
- [ ] CSRF protection (stateless API doesn't need CSRF tokens)
- [ ] Rate limiting on authentication endpoints
- [ ] Input validation on all endpoints
- [ ] Output encoding for API responses
- [ ] Dependency vulnerability scanning (OWASP Dependency-Check)
- [ ] Password requirements enforced (8+ chars, mixed case, number, special)
- [ ] BCrypt hashing with salt (Spring Security default)
- [ ] Sensitive data logging prevented (no passwords, tokens in logs)
- [ ] Account lockout after failed attempts (optional)

---

## API Response Examples

### Successful Task Creation (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement authentication",
    "description": "Add JWT auth to backend",
    "status": "TODO",
    "priority": "HIGH",
    "sprintId": null,
    "assignedToId": null,
    "reviewerId": null,
    "projectId": null,
    "sprintName": null,
    "projectName": null,
    "storyPoints": 3,
    "comments": "Needs backend and frontend review",
    "dueDate": "2026-07-10",
    "createdAt": "2026-07-03T10:30:00Z",
    "updatedAt": "2026-07-03T10:30:00Z"
  },
  "message": "Task created successfully",
  "timestamp": "2026-07-03T10:30:00Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Task title cannot be empty",
  "timestamp": "2026-07-03T10:31:00Z"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "timestamp": "2026-07-03T10:32:00Z"
}
```

---

## Verification Checklist

### Sprint 1 (Auth)
- [ ] User registration endpoint working
- [ ] Email validation on registration
- [ ] Password hashing verified (BCrypt)
- [ ] Login endpoint returns JWT
- [ ] JWT refresh endpoint working
- [ ] Protected endpoints reject unauthenticated requests
- [ ] ProtectedRoute redirects to login
- [ ] Docker Compose starts all services
- [ ] Tests passing (70%+ coverage)

### Sprint 2 (Tasks)
- [ ] Task creation with validation
- [ ] Task list retrieval (paginated)
- [ ] Filtering by status/priority/date
- [ ] Task update (permission check passes)
- [ ] Task deletion
- [ ] TaskList component displays tasks
- [ ] TaskForm validation works
- [ ] TanStack Query integration working
- [ ] Tests passing (75%+ coverage)

### Sprint 3 (Sprints/Kanban)
- [x] Project creation endpoint
- [x] Project creation/editing UI
- [x] Sprint creation endpoint
- [x] Sprints require project linkage
- [x] Kanban board displays 3 columns
- [ ] Drag-and-drop updates status
- [x] Sprint statistics calculated correctly
- [x] Sprint statistics displayed on UI
- [ ] Responsive on mobile devices
- [ ] Tests passing (75%+ coverage)

### Sprint 4 (DevOps/Production)
- [ ] CI/CD pipeline runs on push
- [ ] Tests fail build on failure
- [ ] Code coverage reports generated
- [ ] Docker images build successfully
- [ ] Production deployment (if applicable)
- [ ] API documentation (Swagger) complete
- [ ] E2E tests written and passing
- [ ] Load test passes 100 concurrent users
- [ ] Zero security vulnerabilities

---

## Key Technical Decisions

| Decision | Alternative | Rationale |
|----------|-------------|-----------|
| JWT over Session Cookies | Session-based auth | Stateless, scalable, frontend flexibility |
| Spring Data JPA | Raw SQL/Hibernate | Type safety, less boilerplate, easier testing |
| PostgreSQL | MySQL, SQLite | ACID compliance, strong data integrity, JSON support |
| React + TypeScript | Vue, Angular | Largest ecosystem, mature, strong typing support |
| TanStack Query | Redux | Automatic caching, less boilerplate, better DX |
| Docker Compose | Manual setup | Consistent environment, easy onboarding, reproducible |
| Flyway | Liquibase | SQL-based migrations, simpler than XML |

---

## Success Metrics

**Backend**
- API response time < 500ms (p95)
- Database queries < 50ms for most operations
- Test coverage: Backend 70%+, Controllers 85%+
- Zero critical/high security vulnerabilities
- Uptime: 99.5% (in production)

**Frontend**
- Lighthouse score > 80
- Time to interactive < 3 seconds
- Core Web Vitals passing (CLS, LCP, FID)
- Test coverage: 60%+
- Mobile-responsive (all breakpoints)

**DevOps**
- CI/CD pipeline duration < 10 minutes
- Docker build time < 5 minutes
- Zero failed deployments (via CI/CD)
- Automated backups running daily
- Monitoring alerts configured

---

## Timeline Overview

```
Week 1-2: Sprint 1 (Auth)
  Mon-Wed: Setup & database design
  Thu-Fri: JWT & auth endpoints
  
Week 3-4: Sprint 2 (Tasks)
  Mon-Tue: Task entity & CRUD endpoints
  Wed-Thu: Task filtering & validation
  Fri: Frontend integration
  
Week 5-6: Sprint 3 (Kanban)
  Mon-Tue: Sprint entity & endpoints
  Wed-Thu: Kanban board component
  Fri: Statistics & refinement
  
Week 7-8: Sprint 4 (DevOps & Production)
  Mon-Tue: CI/CD pipeline
  Wed-Thu: Testing & documentation
  Fri: Final UAT & go-live
```

---

## Next Steps (When Ready to Implement)

1. **Environment Setup**
   - Java 21 JDK installed
   - Maven 3.8+ installed
   - Node.js 18+ installed
   - Docker & Docker Compose installed
   - PostgreSQL Docker image ready

2. **Repository Setup**
   - Initialize Git repository
   - Create main, develop, feature branches
   - Setup .gitignore for backend + frontend

3. **Sprint 1 Kickoff**
   - Create Maven project structure
   - Setup Spring Boot starter dependencies
   - Scaffold React project with Vite
   - Create first database migration
   - Begin JWT implementation

---

## References & Resources

**Spring Boot**
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Reference](https://spring.io/projects/spring-security)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)

**React & Frontend**
- [React Documentation](https://react.dev)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Router Guide](https://reactrouter.com)

**Database & Migrations**
- [Flyway Documentation](https://flywaydb.org)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

**Testing**
- [JUnit 5 Guide](https://junit.org/junit5)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev)

**DevOps**
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Guide](https://docs.github.com/en/actions)

---

**Document Last Updated:** 2026-07-06  
**Version:** 1.1 (Implementation Snapshot)  
**Status:** Implementation in progress
