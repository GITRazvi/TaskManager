<!-- File responsibility: Summarizes completed implementation work and current project capabilities. -->
# Implemented So Far

Status snapshot: 2026-07-03.

This file reflects what is present in the repository source tree. It does not mark runtime behavior as complete unless the supporting application code exists.

## Planning

- Created the main project plan in `plan/PROJECT_PLAN.md`.
- Created sprint-level checklists in `plan/SPRINT_CHECKLISTS.md`.
- Created the technology stack reference in `plan/TECH_STACK.md`.

## Backend Foundation

- Created the Spring Boot backend project under `backend/`.
- Added Maven configuration in `backend/pom.xml`.
- Added Java 21 / Spring Boot 3.2.5 dependencies for:
  - Spring Web
  - Spring Security
  - Spring Data JPA
  - Bean Validation
  - Actuator
  - PostgreSQL
  - Flyway
  - Lombok
  - Jackson Java time support
  - Springdoc OpenAPI
  - JWT libraries
  - JUnit, Mockito, Spring Security Test, H2, and Testcontainers
- Created the backend main class:
  - `backend/src/main/java/com/taskmanager/TaskManagerApplication.java`
- Enabled transaction management and async support on the backend application class.

## Backend Configuration

- Added base application configuration:
  - `backend/src/main/resources/application.yml`
- Added environment-specific profiles:
  - `backend/src/main/resources/application-dev.yml`
  - `backend/src/main/resources/application-test.yml`
  - `backend/src/main/resources/application-prod.yml`
- Configured PostgreSQL datasource defaults.
- Configured Hibernate validation mode with Flyway-managed schema.
- Configured Flyway migration location.
- Configured Jackson date/time serialization defaults.
- Configured CORS properties.
- Configured JWT properties.
- Configured server compression and actuator exposure.
- Added Logback configuration:
  - `backend/src/main/resources/logback-spring.xml`

## Backend Domain Model

- Created `User` entity:
  - `backend/src/main/java/com/taskmanager/entity/User.java`
- Created `Task` entity:
  - `backend/src/main/java/com/taskmanager/entity/Task.java`
- Created `Sprint` entity:
  - `backend/src/main/java/com/taskmanager/entity/Sprint.java`
- Added entity relationships:
  - User to tasks
  - User to sprints
  - Task to user
  - Task to sprint
  - Task to assignee
  - Sprint to tasks
- Added timestamp fields using Hibernate creation/update timestamps.
- Added UUID primary key generation.

## Backend Enums

- Created task status enum:
  - `backend/src/main/java/com/taskmanager/entity/enums/TaskStatus.java`
- Created task priority enum:
  - `backend/src/main/java/com/taskmanager/entity/enums/TaskPriority.java`
- Created sprint status enum:
  - `backend/src/main/java/com/taskmanager/entity/enums/SprintStatus.java`

## Backend Persistence

- Created `UserRepository`:
  - `backend/src/main/java/com/taskmanager/repository/UserRepository.java`
- Created `TaskRepository`:
  - `backend/src/main/java/com/taskmanager/repository/TaskRepository.java`
- Created `SprintRepository`:
  - `backend/src/main/java/com/taskmanager/repository/SprintRepository.java`
- Added repository methods for:
  - User lookup by email and username
  - User existence checks
  - User task pagination
  - Task lookup by task ID and user ID
  - Sprint task lookup by status
  - Task filtering by status, priority, and due date range
  - Sprint lookup by user, status, and ID

## Database Migrations

- Added Flyway migrations:
  - `V1__Create_users_table.sql`
  - `V2__Create_tasks_table.sql`
  - `V3__Create_sprints_table.sql`
  - `V4__Add_sprint_to_tasks.sql`
  - `V5__Create_audit_logs_table.sql`
  - `V6__Add_indexes.sql`
- Added database tables for:
  - users
  - tasks
  - sprints
  - audit_logs
- Added indexes for common user, task, sprint, audit log, and timestamp lookups.

## Backend Security Foundation

- Created `SecurityConfig`:
  - `backend/src/main/java/com/taskmanager/config/SecurityConfig.java`
- Disabled CSRF for a stateless API.
- Configured stateless session management.
- Added CORS configuration source.
- Added password encoder bean using BCrypt.
- Opened public access for:
  - health endpoint
  - OpenAPI docs
  - Swagger UI
  - auth register/login/refresh paths
- Required authentication for all other requests.

## Backend API Support Classes

- Created generic API response DTO:
  - `backend/src/main/java/com/taskmanager/dto/ApiResponse.java`
- Created exception base and common exception classes:
  - `AppException`
  - `UnauthorizedException`
  - `ForbiddenException`
  - `ResourceNotFoundException`
- Created global exception handler:
  - `backend/src/main/java/com/taskmanager/exception/GlobalExceptionHandler.java`

## Backend Endpoint First Pass

- Implemented JWT security support:
  - `JwtTokenProvider`
  - `JwtAuthenticationFilter`
  - `UserPrincipal`
- Wired JWT authentication into `SecurityConfig`.
- Implemented authentication DTOs and endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Implemented user profile DTOs, service logic, and endpoints:
  - `GET /api/users/{id}`
  - `PUT /api/users/{id}`
  - `PUT /api/users/{id}/password`
- Implemented task DTOs, service logic, filtering, pagination, and endpoints:
  - `GET /api/tasks`
  - `GET /api/tasks/{id}`
  - `POST /api/tasks`
  - `PUT /api/tasks/{id}`
  - `DELETE /api/tasks/{id}`
  - `PATCH /api/tasks/{id}/status`
- Implemented sprint DTOs, service logic, board/statistics responses, and endpoints:
  - `GET /api/sprints`
  - `GET /api/sprints/{id}`
  - `POST /api/sprints`
  - `PUT /api/sprints/{id}`
  - `GET /api/sprints/{id}/tasks`
  - `GET /api/sprints/{id}/stats`
- Added explicit entity getters/setters so the backend compiles reliably even when Lombok annotation processing is unavailable.
- Verified backend compilation with:
  - `mvn test` using `JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`

## Backend Documentation And Packaging

- Added backend README:
  - `backend/README.md`
- Added backend Dockerfile:
  - `backend/Dockerfile`
- Added backend `.dockerignore`.
- Added backend `.env.example`.
- Added backend `.gitignore`.

## Frontend

- Created frontend folder structure:
  - `frontend/public/`
  - `frontend/src/api/`
  - `frontend/src/components/Auth/`
  - `frontend/src/components/Common/`
  - `frontend/src/hooks/`
  - `frontend/src/store/`
  - `frontend/src/types/`
- Created the React/Vite TypeScript frontend project files:
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `frontend/index.html`
  - `frontend/vite.config.ts`
  - `frontend/vitest.config.ts`
  - `frontend/tsconfig.json`
  - `frontend/src/main.tsx`
  - `frontend/src/App.tsx`
  - `frontend/src/index.css`
- Implemented shared frontend types for auth, users, tasks, sprints, API envelopes, filters, and board/stat responses.
- Implemented Axios API client with authorization header injection and `401` session clearing.
- Implemented API modules for:
  - auth
  - tasks
  - sprints
- Implemented Zustand auth persistence for access token, refresh token, and current user profile.
- Implemented TanStack Query hooks for auth, task, and sprint workflows.
- Implemented authentication pages and forms:
  - login
  - registration
  - protected route handling
  - logout from the app shell
- Implemented the authenticated application shell with dashboard, tasks, and sprints navigation.
- Implemented task UI for listing, filtering, creating, editing, deleting, status changes, and pagination.
- Implemented sprint UI for creating/selecting sprints, viewing sprint statistics, and rendering a status board.
- Added a frontend smoke test for the shared loading component.
- Verified frontend build with `npm.cmd run build`.
- Verified frontend tests with `npm.cmd test -- --run`.
- Started the Vite dev server at `http://127.0.0.1:5173/`.
- Added frontend containerization:
  - `frontend/Dockerfile`
  - `frontend/.dockerignore`
  - `frontend/nginx.conf`
- Added a `frontend` service to root `docker-compose.yml`.
- Configured frontend Nginx SPA routing and `/api/` proxying to the backend service.
- Verified the frontend Docker image builds with `docker compose build frontend`.
- Verified the composed frontend service starts and reports healthy at `http://localhost:3000/health`.

## Current Implementation Boundary

The repository currently contains backend foundation, domain models, repositories, migrations, security configuration, JWT authentication support, REST controllers, service logic, shared response/error handling, documentation, a first usable frontend implementation, and Docker Compose wiring for database, backend, and frontend services. It does not yet contain broad frontend component coverage, backend controller/repository coverage, or CI/CD.
