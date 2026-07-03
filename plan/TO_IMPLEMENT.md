<!-- File responsibility: Lists remaining features, fixes, and follow-up implementation tasks. -->
# To Implement

Status snapshot: 2026-07-03.

This file tracks the remaining implementation work based on the current repository state and the sprint plan.

## Backend Endpoint Follow-Up

- Add persistent refresh-token storage and invalidation instead of the current stateless refresh-token pass.
- Add a real logout invalidation strategy if refresh tokens are persisted.
- Add a custom authentication entry point and access denied handler so Spring Security `401` and `403` responses use the same `ApiResponse` shape as application errors.
- Decide whether users should be able to assign tasks to other users; the current endpoint pass only allows assignment to the current user.
- Add a way to clear nullable task fields such as `sprintId`, `assignedToId`, and `dueDate` if the product needs explicit unassignment.
- Add delete/archive behavior for sprints if required.
- Add OpenAPI annotations/examples for the implemented endpoint contracts.

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
  - JWT provider/filter behavior
- Add repository tests where custom query behavior needs verification.
- Add controller integration tests for:
  - Auth endpoints
  - User endpoints
  - Task endpoints
  - Sprint endpoints
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
- Add assignee handling if cross-user assignment becomes supported by the backend.

## Frontend Sprint And Kanban UI

- Add sprint edit flow.
- Implement drag-and-drop task status changes.
- Add sprint assignment/filtering polish to task flows.
- Add board loading placeholders and optimistic status updates.

## Frontend Tests

- Expand component tests for:
  - Login form.
  - Register form.
  - Protected route.
  - Task list.
  - Task form.
  - Task filters.
  - Sprint board.
- Add state/API tests for auth persistence and API error handling.
- Add end-to-end tests for:
  - Register or login.
  - Create task.
  - Update task.
  - Create sprint.
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
- Verify sprint/Kanban flow.
- Verify Docker Compose full-stack startup.
