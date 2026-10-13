<!-- File responsibility: Lists remaining features, fixes, and follow-up implementation tasks. -->
# To Implement

Status snapshot: 2026-07-15.

This file tracks the remaining implementation work based on the current repository state and the sprint plan.

## Backend Endpoint Follow-Up

- Add persistent refresh-token storage and invalidation instead of the current stateless refresh-token pass.
- Add a real logout invalidation strategy if refresh tokens are persisted.
- Add a custom authentication entry point and access denied handler so Spring Security `401` and `403` responses use the same `ApiResponse` shape as application errors.
- Replace the current project-role permission helpers with granular issue-type/workflow permissions if the product needs exact Jira-style rules for bugs, stories, approvals, attachments, and viewer comment policy.
- Decide whether Scrum Masters and Product Owners should be able to assign or move tasks they do not own; the current backend still limits some task body edits to task owners plus project managers.
- Add a way to clear nullable task fields such as `sprintId`, `assignedToId`, and `dueDate` if the product needs explicit unassignment.
- Decide whether task comments should stay as a single editable notes field or become a threaded comment model with authors and timestamps.
- Add delete/archive behavior for projects if required.
- Add OpenAPI annotations/examples for the implemented endpoint contracts.

## Backend Project And Sprint Follow-Up

- Add project deletion behavior only after defining what should happen to linked sprints and tasks.
- Add controller/integration tests for:
  - Project endpoints.
  - Project member add/update/remove endpoints.
  - Sprint creation with a required `projectId`.
  - Rejecting sprint creation or update with a project owned by another user.
- Verify Flyway migration `V9__Create_projects_and_link_sprints.sql` against an existing database with sprints.

## Backend Audit Logging

- Create `AuditLog` entity if audit logs are kept in application code.
- Create audit log repository.
- Add audit log writes for important task/sprint/user actions.
- Decide whether audit logging is synchronous, async, or event-based.

## Backend Validation And Error Handling

- Add Bean Validation annotations to all request DTOs.
- Normalize API error response shape.
- Add validation handling for:
  - Invalid credentials.
  - Duplicate email/username.
  - Missing task title.
  - Invalid enum values.
  - Invalid sprint dates.
  - Unauthorized access.
  - Forbidden cross-user access.
  - Missing resources.
- Confirm security responses return correct `401` and `403` statuses.

## Backend Tests

- Add unit tests for:
  - `AuthService`
  - `UserService`
  - `TaskService`
  - `SprintService`
  - `ProjectService`
  - JWT provider/filter behavior
- Add repository tests where custom query behavior needs verification.
- Add controller integration tests for:
  - Auth endpoints
  - User endpoints
  - Task endpoints
  - Project endpoints
  - Sprint endpoints
- Add project-role authorization tests covering all supported roles across project member, project, sprint, task, status, and comment endpoints.
- Add security tests for:
  - Unauthenticated access rejection.
  - Authenticated access.
  - Cross-user authorization failures.
- Generate and enforce coverage targets from the plan.

## Frontend Project Setup Follow-Up

- Decide whether to keep the current plain CSS styling approach or migrate to Tailwind CSS.
- Add a frontend README with setup, environment, and local development instructions.
- Add example `.env` values for `VITE_API_BASE_URL`.
- Add production-focused frontend security headers if the Nginx runtime is used beyond local development.

## Frontend API And State

- Add refresh-token retry behavior once backend refresh-token persistence/invalidation is finalized.
- Add `src/api/users.ts` if profile editing is included in the first frontend release.
- Expand API error handling for `403` and server errors with user-facing recovery flows.

## Frontend Authentication UI

- Add profile editing and change-password screens if included in scope.
- Add explicit loading state while persisted sessions rehydrate and `/api/auth/me` is checked.
- Add success feedback for account creation and logout flows.

## Frontend Task UI

- Add delete confirmation before task removal.
- Keep URL query params in sync with filters if required by the plan.
- Add richer empty/error states for backend downtime and expired sessions.
- Add explicit clear/unassign controls for assignee, reviewer, sprint, due date, story points, and comments if the product requires clearing those fields after creation.

## Frontend Sprint And Kanban UI

- Add sprint assignment/filtering polish to task flows.
- Add project filtering for sprint lists if the number of projects/sprints grows.
- Add board loading placeholders and optimistic status updates.

## Frontend Project UI

- Add project delete/archive UI once backend behavior is defined.
- Add richer empty states that link users from Sprints to Projects when no project exists.
- Add project-specific sprint counts and recently updated sprint summaries if useful.

## Frontend Tests

- Expand component tests for:
  - Login form.
  - Register form.
  - Protected route.
  - Task list.
  - Task form.
  - Task filters.
  - Project page.
  - Project form.
  - Sprint board.
- Add state/API tests for auth persistence and API error handling.
- Add end-to-end tests for:
  - Register or login.
  - Create task.
  - Update task.
  - Create project.
  - Create sprint.
  - Verify a sprint cannot be created without a project.
  - View Kanban board.

## DevOps And Runtime

- Validate backend Docker build.
- Add CI pipeline for:
  - Backend tests.
  - Frontend tests.
  - Builds.
  - Coverage reporting.
  - Dependency vulnerability checks.
- Add production deployment configuration if deployment is in scope.

## Documentation

- Update backend README once endpoints are actually implemented.
- Add frontend README or root README for full-stack startup.
- Add API examples for implemented endpoints.
- Add Swagger annotations or descriptions where useful.
- Document environment variables for backend and frontend.

## Verification Needed

- Run backend tests once tests exist.
- Run frontend tests once the frontend project exists.
- Start PostgreSQL and verify Flyway migrations run cleanly.
- Start backend and verify health endpoint.
- Verify Swagger/OpenAPI output.
- Verify full auth flow.
- Verify task CRUD flow.
- Verify project CRUD flow.
- Verify sprint/Kanban flow.
- Verify every sprint is linked to a project.
- Verify Docker Compose full-stack startup.
