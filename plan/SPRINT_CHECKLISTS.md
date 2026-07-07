<!-- File responsibility: Tracks sprint-level implementation checklists and delivery status. -->
# Sprint Checklists & Quick Reference

## Sprint 1: Foundation & Authentication (Weeks 1-2)

### Backend Tasks

#### Setup & Configuration
- [ ] Create Maven project structure (`mvn archetype:generate`)
- [ ] Add Spring Boot 3.x dependencies to pom.xml
- [ ] Create `TaskManagerApplication.java` main class
- [ ] Configure `application.yml` with PostgreSQL settings
- [ ] Setup application profiles (dev, test, prod)
- [ ] Configure logging with `logback-spring.xml`

#### Database & Entities
- [ ] Create `User.java` entity with JPA annotations
- [ ] Create `UserRepository.java` Spring Data JPA
- [ ] Create V1__Create_users_table.sql Flyway migration
- [ ] Run migration: verify table creation in PostgreSQL

#### Security Configuration
- [ ] Create `JwtTokenProvider.java` (generate/validate tokens)
- [ ] Implement token generation (HS512, claims)
- [ ] Implement token validation and claim extraction
- [ ] Create `JwtAuthenticationFilter.java` (extract JWT from header)
- [ ] Create `CustomUserDetails.java` (UserDetails implementation)
- [ ] Create `SecurityConfig.java` (Spring Security configuration)
- [ ] Configure CORS (allow frontend domain)
- [ ] Disable CSRF (stateless API)
- [ ] Setup public endpoints (/api/auth/register, /api/auth/login)

#### Controllers & Services
- [ ] Create `AuthController.java` with endpoints:
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] POST /api/auth/refresh
  - [ ] POST /api/auth/logout
  - [ ] GET /api/auth/me
- [ ] Create `AuthService.java` with logic:
  - [ ] User registration (validate input, hash password)
  - [ ] User login (validate credentials, generate JWT)
  - [ ] Token refresh (validate refresh token)
- [ ] Create `UserService.java` with helper methods

#### DTOs & Exception Handling
- [ ] Create `LoginRequest.java` and `RegisterRequest.java` DTOs
- [ ] Create `AuthResponse.java` DTO
- [ ] Create `ApiResponse.java` generic response wrapper
- [ ] Create exception classes:
  - [ ] `AppException.java`
  - [ ] `UnauthorizedException.java`
  - [ ] `ResourceNotFoundException.java`
- [ ] Create `GlobalExceptionHandler.java` (@ControllerAdvice)

#### Testing
- [ ] Write `AuthServiceTest.java` (unit tests)
  - [ ] Test user registration
  - [ ] Test login success
  - [ ] Test invalid credentials
  - [ ] Test token generation
- [ ] Write `AuthControllerTest.java` (integration tests)
  - [ ] Test /api/auth/register endpoint
  - [ ] Test /api/auth/login endpoint
  - [ ] Test protected endpoint with JWT
- [ ] Verify test coverage >= 70%
- [ ] Write test for password hashing (BCrypt)

#### Documentation
- [ ] Document JWT flow in README
- [ ] Document API endpoints
- [ ] Create example API requests (Postman collection or curl)

### Frontend Tasks

#### Project Setup
- [ ] Create React project with Vite (`npm create vite@latest`)
- [ ] Install TypeScript support
- [ ] Setup tsconfig.json
- [ ] Install core dependencies:
  - [ ] react-router-dom
  - [ ] axios
  - [ ] zustand
  - [ ] tailwindcss
  - [ ] react-hook-form
  - [ ] zod

#### API Client Setup
- [ ] Create `src/api/client.ts` (Axios instance)
- [ ] Implement JWT interceptor (add Authorization header)
- [ ] Implement error interceptor (handle 401, 403, 500)
- [ ] Create `src/api/auth.ts` (auth endpoints)
- [ ] Create type definitions in `src/types/index.ts`

#### Authentication Components
- [ ] Create `src/components/Auth/LoginForm.tsx`
  - [ ] Form with email/password fields
  - [ ] React Hook Form + Zod validation
  - [ ] Submit handler calls authApi.login()
  - [ ] Error message display
  - [ ] Loading state
- [ ] Create `src/components/Auth/RegisterForm.tsx`
  - [ ] Form with email/password/confirm password fields
  - [ ] Password strength validation
  - [ ] Submit handler calls authApi.register()
  - [ ] Show success message

#### State Management
- [ ] Create `src/store/authStore.ts` (Zustand auth state)
  - [ ] Store JWT token
  - [ ] Store user info (id, email)
  - [ ] Actions: setToken, setUser, logout
  - [ ] localStorage persistence
- [ ] Create `src/hooks/useAuth.ts` (custom hook)

#### Routing & Protected Routes
- [ ] Create `src/components/Layout/ProtectedRoute.tsx`
  - [ ] Check if user authenticated
  - [ ] If not, redirect to /login
  - [ ] Otherwise, render protected component
- [ ] Create `src/pages/LoginPage.tsx`
- [ ] Create `src/pages/RegisterPage.tsx`
- [ ] Create `src/pages/DashboardPage.tsx` (placeholder)
- [ ] Create `src/App.tsx` with React Router setup:
  - [ ] <BrowserRouter>
  - [ ] <Routes>
  - [ ] Public routes (login, register)
  - [ ] Protected routes (dashboard)

#### Testing
- [ ] Write tests for LoginForm component
- [ ] Write tests for ProtectedRoute component
- [ ] Test JWT storage in localStorage
- [ ] Test redirect to login when unauthenticated

#### Styling
- [ ] Setup Tailwind CSS
- [ ] Create basic layout components
- [ ] Style login/register forms
- [ ] Mobile responsive design

### Docker & Deployment

#### Docker Setup
- [ ] Create `backend/Dockerfile` (multi-stage build)
- [ ] Create `backend/.dockerignore`
- [ ] Create `frontend/Dockerfile` (Node build + Nginx)
- [ ] Create `frontend/nginx.conf` (Nginx reverse proxy config)
- [ ] Create `docker-compose.yml` with 3 services:
  - [ ] PostgreSQL (port 5432)
  - [ ] Spring Boot app (port 8080)
  - [ ] React app + Nginx (port 3000)

#### Testing Docker Setup
- [ ] Run `docker-compose up`
- [ ] Verify PostgreSQL starts
- [ ] Verify backend starts (migrations run)
- [ ] Verify frontend starts
- [ ] Test login flow in browser (localhost:3000)

### Documentation
- [ ] Create README with setup instructions
- [ ] Document API endpoints (Swagger or OpenAPI)
- [ ] Create quick start guide

### Definition of Done Checklist
- [ ] All backend unit tests passing (70%+ coverage)
- [ ] All backend integration tests passing
- [ ] All frontend component tests passing
- [ ] Docker Compose runs without errors
- [ ] User can register â†’ login â†’ receive JWT
- [ ] Protected endpoints return 401 without JWT
- [ ] Frontend stores JWT and uses in requests
- [ ] ProtectedRoute redirects unauthenticated users
- [ ] Code review completed
- [ ] PR merged to main

---

## Sprint 2: Task Management (Weeks 3-4)

### Backend Tasks

#### Entities & Database
- [ ] Create `Task.java` entity
- [ ] Create `TaskStatus.java` enum (TODO, IN_PROGRESS, DONE)
- [ ] Create `TaskPriority.java` enum (LOW, MEDIUM, HIGH, CRITICAL)
- [ ] Create V2__Create_tasks_table.sql migration
- [x] Add reviewer, story points, and comments metadata to tasks
- [ ] Create `TaskRepository.java`
  - [ ] `List<Task> findAllByUserId(UUID userId)`
  - [ ] `Task findByIdAndUserId(UUID id, UUID userId)`
  - [ ] Custom queries for filtering

#### Service Layer
- [ ] Create `TaskService.java` with methods:
  - [ ] `Task createTask(TaskCreateRequest, UUID userId)`
  - [ ] `List<Task> getUserTasks(UUID userId, filters)`
  - [ ] `Task getTaskById(UUID id, UUID userId)` - permission check
  - [ ] `Task updateTask(UUID id, TaskUpdateRequest, UUID userId)`
  - [ ] `void deleteTask(UUID id, UUID userId)`
  - [ ] `Task updateTaskStatus(UUID id, TaskStatus status, UUID userId)`
- [ ] Add validation logic (title required, due date not in past, priority enum)
- [ ] Add permission checks (only owner can modify)

#### Controller
- [ ] Create `TaskController.java` with endpoints:
  - [ ] GET /api/tasks (with pagination & filters)
  - [ ] GET /api/tasks/{id}
  - [ ] POST /api/tasks
  - [ ] PUT /api/tasks/{id}
  - [ ] DELETE /api/tasks/{id}
  - [ ] PATCH /api/tasks/{id}/status
- [ ] Implement pagination (page, size parameters)
- [ ] Implement filtering (status, priority, dateRange query params)

#### DTOs
- [ ] Create `TaskCreateRequest.java`
- [ ] Create `TaskUpdateRequest.java`
- [ ] Create `TaskResponse.java`
- [ ] Create `TaskListResponse.java` (paginated)
- [ ] Create `PaginationParams.java`

#### Testing
- [ ] Create `TaskServiceTest.java`
  - [ ] Test task creation with validation
  - [ ] Test user can only see their own tasks
  - [ ] Test filtering by status/priority
  - [ ] Test permission checks
- [ ] Create `TaskControllerTest.java`
  - [ ] Test all 6 endpoints
  - [ ] Test 404 for non-existent task
  - [ ] Test 403 for accessing other user's task
  - [ ] Test response format

### Frontend Tasks

#### API Integration
- [ ] Create `src/api/tasks.ts` (task endpoints)
  - [ ] getTasks(filters)
  - [ ] getTask(id)
  - [ ] createTask(data)
  - [ ] updateTask(id, data)
  - [ ] deleteTask(id)

#### Custom Hooks
- [ ] Create `src/hooks/useTasks.ts`
  - [ ] Use TanStack Query for fetching tasks
  - [ ] useQuery for GET operations
  - [ ] useMutation for POST/PUT/DELETE
  - [ ] Handle loading/error states

#### Components
- [ ] Create `src/components/Tasks/TaskCard.tsx`
  - [ ] Display task info (title, priority, status, due date)
  - [ ] Show edit/delete buttons
  - [ ] Responsive card design
  
- [ ] Create `src/components/Tasks/TaskList.tsx`
  - [ ] Display paginated list of tasks
  - [ ] Integrate useTasks hook
  - [ ] Show loading spinner
  - [ ] Show empty state
  - [ ] Pagination controls

- [ ] Create `src/components/Tasks/TaskFilters.tsx`
  - [ ] Filter by status dropdown
  - [ ] Filter by priority dropdown
  - [ ] Filter by date range
  - [ ] Apply/reset filters
  - [ ] Update URL query params

- [ ] Create `src/components/Tasks/TaskForm.tsx`
  - [ ] Form fields: title, description, priority, dueDate
  - [x] Form fields: reviewer, story points, comments
  - [ ] React Hook Form + Zod validation
  - [ ] Create mode (POST) vs Edit mode (PUT)
  - [ ] Submit handler
  - [ ] Error display

#### Pages
- [ ] Update `src/pages/TasksPage.tsx`
  - [ ] Render TaskFilters + TaskList
  - [ ] Handle filter state
  - [ ] Modal/form for creating/editing tasks

#### Testing
- [ ] Create component tests for TaskCard
- [ ] Create component tests for TaskList
- [ ] Create component tests for TaskForm
- [ ] Test filtering functionality
- [ ] Test form validation

### Definition of Done Checklist
- [ ] All backend unit tests passing (75%+ coverage)
- [ ] All backend integration tests passing
- [ ] All frontend component tests passing
- [ ] User can create a task
- [ ] User can view all their tasks
- [ ] Filtering by status/priority works
- [ ] User can edit and delete tasks
- [ ] Form validation prevents invalid submissions
- [ ] TaskList paginated correctly
- [ ] Permission checks verified (403 on other user's task)
- [ ] Code review completed
- [ ] PR merged to main

---

## Sprint 3: Projects, Sprints & Kanban Board (Weeks 5-6)

### Backend Tasks

#### Entities & Database
- [x] Create `Project.java` entity
- [ ] Create `Sprint.java` entity
- [ ] Create `SprintStatus.java` enum (PLANNING, ACTIVE, COMPLETED, ARCHIVED)
- [ ] Create V3__Create_sprints_table.sql migration
- [ ] Create V4__Add_sprint_to_tasks.sql migration
- [x] Create V9__Create_projects_and_link_sprints.sql migration
- [x] Make sprints require a linked `project_id`
- [x] Backfill existing sprints into per-user `General` projects
- [x] Create `ProjectRepository.java` with ownership queries
- [ ] Create `SprintRepository.java` with queries
- [ ] Add `findBySprintIdAndStatus(UUID sprintId, TaskStatus status)` to `TaskRepository.java`

#### Service Layer
- [x] Create `ProjectService.java` with methods:
  - [x] `Project createProject(ProjectCreateRequest, UUID userId)`
  - [x] `List<Project> getUserProjects(UUID userId)`
  - [x] `Project getProjectById(UUID id, UUID userId)`
  - [x] `Project updateProject(UUID id, ProjectUpdateRequest, UUID userId)`
- [ ] Create `SprintService.java` with methods:
  - [ ] `Sprint createSprint(SprintCreateRequest, UUID userId)`
  - [ ] `List<Sprint> getUserSprints(UUID userId)`
  - [ ] `Sprint getSprintById(UUID id, UUID userId)`
  - [ ] `Sprint updateSprint(UUID id, SprintUpdateRequest, UUID userId)`
  - [ ] `List<Task> getSprintBoard(UUID sprintId)` - tasks grouped by status
  - [ ] `SprintStats calculateStatistics(UUID sprintId)`
- [ ] Add validation (end_date > start_date)
- [x] Add sprint project ownership validation

#### Controller
- [x] Create `ProjectController.java` with endpoints:
  - [x] GET /api/projects
  - [x] GET /api/projects/{id}
  - [x] POST /api/projects
  - [x] PUT /api/projects/{id}
- [ ] Create `SprintController.java` with endpoints:
  - [ ] GET /api/sprints
  - [ ] GET /api/sprints/{id}
  - [ ] POST /api/sprints
  - [ ] PUT /api/sprints/{id}
  - [ ] GET /api/sprints/{id}/tasks (Kanban board data)
  - [ ] GET /api/sprints/{id}/stats

#### DTOs
- [x] Create `ProjectCreateRequest.java`
- [x] Create `ProjectUpdateRequest.java`
- [x] Create `ProjectResponse.java`
- [ ] Create `SprintCreateRequest.java`
- [ ] Create `SprintResponse.java`
- [ ] Create `SprintBoardResponse.java` (tasks grouped by status)
- [ ] Create `SprintStatsResponse.java` (completion %, velocity)

#### Testing
- [x] Create `ProjectServiceTest.java`
  - [x] Test project creation
  - [x] Test blank project name rejection
- [ ] Create `SprintServiceTest.java`
  - [ ] Test sprint creation
  - [ ] Test statistics calculation
  - [ ] Test permission checks
- [ ] Create `SprintControllerTest.java`
  - [ ] Test all 6 endpoints

### Frontend Tasks

#### API Integration
- [x] Create `src/api/projects.ts` (project endpoints)
- [x] Create `src/hooks/useProjects.ts` (TanStack Query)
- [ ] Create `src/api/sprints.ts` (sprint endpoints)
- [ ] Create `src/hooks/useSprints.ts` (TanStack Query)

#### Components
- [x] Create project creation/editing UI
- [ ] Create `src/components/Sprints/SprintForm.tsx`
  - [x] Form fields: name, description, project, startDate, endDate
  - [ ] Validation (endDate > startDate)
  - [x] Require project selection before sprint creation

- [ ] Create `src/components/Sprints/SprintBoard.tsx` (Main Kanban Component)
  - [ ] Display 3 columns: TODO, IN_PROGRESS, DONE
  - [ ] Fetch tasks from /api/sprints/{id}/tasks
  - [ ] Display task count per column
  - [ ] Responsive (scrollable on mobile)

- [ ] Create `src/components/Tasks/TaskCard.tsx` modifications
  - [ ] Make draggable within Kanban board
  - [ ] Show priority/due date
  - [x] Open task details from sprint board click
  - [x] Show description, comments, assignee, reviewer, story points, sprint, and parent project link in task details
  - [x] Edit story points directly from the opened sprint-board task details

- [ ] Setup Drag-and-Drop Library
  - [ ] Install dnd-kit
  - [ ] Implement DndContext, useDroppable, useDraggable/useSortable
  - [ ] Handle drop â†’ update task status

- [ ] Create `src/components/Sprints/SprintStats.tsx`
  - [ ] Display completion percentage
  - [ ] Display velocity (completed tasks count)
  - [ ] Display tasks by priority chart (Recharts)
  - [ ] Install recharts library

#### Pages
- [x] Create `src/pages/ProjectsPage.tsx`
- [ ] Create `src/pages/SprintBoardPage.tsx`
  - [ ] Fetch sprint by ID
  - [ ] Render SprintBoard
  - [ ] Render SprintStats

#### Testing
- [ ] Create component tests for SprintBoard
- [ ] Create component tests for TaskCard (dragging)
- [ ] Test drag-and-drop functionality
- [ ] Test stats calculation

### Definition of Done Checklist
- [ ] All backend unit tests passing (75%+ coverage)
- [ ] All backend integration tests passing
- [ ] All frontend component tests passing
- [x] User can create and edit projects
- [x] User can create a sprint
- [x] Sprint creation requires a linked project
- [x] User can view sprint board (Kanban)
- [ ] Drag-and-drop updates task status
- [x] Sprint statistics calculated and displayed
- [ ] Kanban responsive on all screen sizes
- [ ] Code review completed
- [ ] PR merged to main

---

## Sprint 4: DevOps, Testing & Polish (Weeks 7-8)

### Backend Tasks

#### CI/CD Pipeline
- [ ] Create `.github/workflows/backend-ci.yml`
  - [ ] Trigger on push/PR
  - [ ] Setup Java 21
  - [ ] Run `mvn clean test` 
  - [ ] Run code quality checks (optional: SpotBugs)
  - [ ] Report test coverage (JaCoCo)
  - [ ] Build Docker image
  - [ ] Push to registry (optional)

#### Testing & Coverage
- [ ] Add JaCoCo Maven plugin to pom.xml
- [ ] Achieve 70%+ code coverage
- [ ] Write E2E integration tests (full flow)
- [ ] Setup code coverage reporting

#### Documentation
- [ ] Add Swagger/OpenAPI (springdoc-openapi dependency)
- [ ] Auto-generate API documentation
- [ ] Create README with backend setup
- [ ] Document environment variables needed
- [ ] Create deployment guide

#### Performance & Security
- [ ] Review database indexes (query performance)
- [ ] Test API response times (should be < 500ms)
- [ ] Security audit (CORS, JWT, input validation)
- [ ] Dependency vulnerability scan

### Frontend Tasks

#### CI/CD Pipeline
- [ ] Create `.github/workflows/frontend-ci.yml`
  - [ ] Trigger on push/PR
  - [ ] Setup Node.js
  - [ ] Run `npm install`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
  - [ ] Report code coverage

#### E2E Testing
- [ ] Install Playwright or Cypress
- [ ] Create E2E test scenarios:
  - [ ] User registration flow
  - [ ] User login flow
  - [ ] Create task flow
  - [ ] Create project flow
  - [ ] Create sprint flow
  - [ ] View sprint board flow
  - [ ] Edit/delete task flow

#### Performance & Accessibility
- [ ] Run Lighthouse audit (target > 80)
- [ ] Check Core Web Vitals
- [ ] Test on mobile devices
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Code splitting & lazy loading

#### Documentation
- [ ] Create README with frontend setup
- [ ] Document component structure
- [ ] Create user guide (screenshots, features)

### Deployment

#### Docker & Compose
- [ ] Optimize Docker images (multi-stage, layers)
- [ ] Create production docker-compose.yml (if needed)
- [ ] Test production build locally
- [ ] Create environment file templates (.env.example)

#### Load Testing
- [ ] Install JMeter or Locust
- [ ] Create load test scenarios (100 concurrent users)
- [ ] Run load test
- [ ] Analyze bottlenecks
- [ ] Optimize if needed

#### Final UAT
- [ ] Create UAT checklist (all features)
- [ ] Manual testing on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify all user stories accepted criteria
- [ ] Bug fixes

### Definition of Done Checklist
- [ ] CI/CD pipelines configured and passing
- [ ] Code coverage: Backend 70%+, Frontend 60%+
- [ ] E2E tests written and passing
- [ ] Load test passes 100 concurrent users
- [ ] API documentation complete
- [ ] Zero security vulnerabilities
- [ ] Lighthouse score > 80
- [ ] UAT 100% passed
- [ ] All code merged to main
- [ ] Ready for production deployment

---

## Quick Reference: Common Tasks

### Running Backend Locally
```bash
cd backend
mvn spring-boot:run
# App runs on http://localhost:8080
# API docs: http://localhost:8080/swagger-ui.html
```

### Running Frontend Locally
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### Running Full Stack (Docker)
```bash
docker-compose up
# PostgreSQL: localhost:5432
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

### Running Tests
```bash
# Backend
cd backend
mvn test
mvn jacoco:report

# Frontend
cd frontend
npm test
npm run coverage
```

### Building for Production
```bash
# Backend
mvn clean package
docker build -t taskmanager-backend .

# Frontend
npm run build
docker build -t taskmanager-frontend .
```

### Database Commands
```bash
# Connect to PostgreSQL
psql -h localhost -U taskmanager_user -d taskmanager_db

# View Flyway migrations applied
SELECT * FROM flyway_schema_history;

# Check tables
\dt

# Export/backup database
pg_dump -U taskmanager_user taskmanager_db > backup.sql
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/auth-login

# Make commits
git add .
git commit -m "feat: implement JWT login"

# Push and create PR
git push origin feature/auth-login

# After approval, merge
git merge --squash feature/auth-login
git push main
```

---

## Common Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| `PostgreSQL connection refused` | Check if Docker container is running: `docker ps` |
| `JWT token invalid` | Verify JWT_SECRET matches between backend and frontend |
| `CORS error in browser` | Check SecurityConfig CORS settings, frontend URL whitelist |
| `Port already in use (8080)` | Kill process: `lsof -ti:8080 \| xargs kill -9` |
| `Node modules not installing` | Delete `node_modules` and `package-lock.json`, run `npm install` again |
| `Flyway migration failed` | Check SQL syntax, verify database user permissions |
| `Tests failing randomly` | Check test isolation, verify test database cleanup |
| `Docker image build slow` | Use `.dockerignore`, enable Docker BuildKit: `DOCKER_BUILDKIT=1 docker build` |

---

## Estimated Time Breakdown

| Component | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|-----------|----------|----------|----------|----------|
| Backend Setup | 5h | 1h | 1h | 2h |
| Frontend Setup | 4h | 1h | 1h | 2h |
| Core Features | 4h | 6h | 6h | 2h |
| Testing | 2h | 2h | 2h | 4h |
| DevOps/Deploy | 2h | 0h | 0h | 6h |
| Documentation | 1h | 1h | 1h | 4h |
| **Total per Sprint** | **18h** | **11h** | **11h** | **20h** |
| **Total Project** | | | | **60 hours** |

---

## Key Metrics to Track

**Backend Metrics:**
- [ ] Code coverage percentage
- [ ] API response time (p50, p95, p99)
- [ ] Database query time
- [ ] Build time
- [ ] Test execution time

**Frontend Metrics:**
- [ ] Bundle size
- [ ] Lighthouse score
- [ ] Time to Interactive (TTI)
- [ ] First Contentful Paint (FCP)
- [ ] Core Web Vitals

**DevOps Metrics:**
- [ ] Build success rate
- [ ] Deployment frequency
- [ ] Mean time to recovery (MTTR)
- [ ] Docker image size
- [ ] CI/CD pipeline duration

---

**Version:** 1.1  
**Last Updated:** 2026-07-07
