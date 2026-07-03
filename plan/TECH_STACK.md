<!-- File responsibility: Documents the selected frontend, backend, database, testing, and deployment technologies. -->
# Technology Stack & Architecture Quick Reference

## Technology Overview

### Backend Stack
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚         Spring Boot 3 Application           â”‚
â”‚  (Java 21 - REST API + JWT Authentication) â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Core Frameworks:                            â”‚
â”‚  â€¢ Spring Web 3.x (REST Endpoints)         â”‚
â”‚  â€¢ Spring Security 6.x (JWT Auth)          â”‚
â”‚  â€¢ Spring Data JPA 3.x (ORM)               â”‚
â”‚  â€¢ Hibernate 6.x (JPA Implementation)      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Database:                                   â”‚
â”‚  â€¢ PostgreSQL 14+ (Primary DB)             â”‚
â”‚  â€¢ Flyway 9.x (Migrations)                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Security & Utilities:                       â”‚
â”‚  â€¢ JJWT (JWT Token Generation)             â”‚
â”‚  â€¢ Lombok (Reduce Boilerplate)             â”‚
â”‚  â€¢ Jackson (JSON Serialization)            â”‚
â”‚  â€¢ Bean Validation (Jakarta Validation)    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Testing:                                    â”‚
â”‚  â€¢ JUnit 5 (Unit Testing)                  â”‚
â”‚  â€¢ Mockito 5.x (Mocking)                   â”‚
â”‚  â€¢ Spring Boot Test (Integration Tests)    â”‚
â”‚  â€¢ Testcontainers (PostgreSQL in Tests)    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Build & Deployment:                         â”‚
â”‚  â€¢ Maven 3.8+ (Build Tool)                 â”‚
â”‚  â€¢ Docker (Containerization)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Frontend Stack
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      React 18+ Application (TypeScript)    â”‚
â”‚  (Modern SPA - Kanban Task Manager UI)     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Core Framework:                             â”‚
â”‚  â€¢ React 18+ (UI Library)                  â”‚
â”‚  â€¢ TypeScript 5.x (Type Safety)            â”‚
â”‚  â€¢ Vite 4.x (Build Tool)                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Routing & Navigation:                       â”‚
â”‚  â€¢ React Router 6.x (Client-side Routing) â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ State Management:                           â”‚
â”‚  â€¢ TanStack Query 4.x (Server State)      â”‚
â”‚  â€¢ Zustand 4.x (Client State)             â”‚
â”‚  â€¢ React Context API (Auth State)         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ API & HTTP:                                 â”‚
â”‚  â€¢ Axios 1.x (HTTP Client)                â”‚
â”‚  â€¢ JWT Interceptor (Auto Token Injection) â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Forms & Validation:                         â”‚
â”‚  â€¢ React Hook Form 7.x (Form Management)  â”‚
â”‚  â€¢ Zod 3.x (Schema Validation)            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ UI & Styling:                               â”‚
â”‚  â€¢ Tailwind CSS 3.x (Utility CSS)         â”‚
â”‚  â€¢ dnd-kit (Drag & Drop)                 â”‚
â”‚  â€¢ Recharts (Charts & Visualizations)     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Testing:                                    â”‚
â”‚  â€¢ Vitest (Unit Testing)                  â”‚
â”‚  â€¢ React Testing Library (Component Tests)â”‚
â”‚  â€¢ MSW (Mock Service Worker)              â”‚
â”‚  â€¢ Playwright (E2E Testing)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### DevOps & Infrastructure
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚        Local Development Stack           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  â€¢ Docker (Containerization)            â”‚
â”‚  â€¢ Docker Compose (Service Orchestration)â”‚
â”‚    - PostgreSQL 14 Container            â”‚
â”‚    - Spring Boot App Container          â”‚
â”‚    - React App (Nginx) Container        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      CI/CD & Automation Stack            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  â€¢ GitHub Actions (CI/CD Pipeline)      â”‚
â”‚    - Automated Testing                  â”‚
â”‚    - Code Quality Checks                â”‚
â”‚    - Docker Image Build                 â”‚
â”‚    - Coverage Reporting                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Production Deployment (Optional)       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Cloud Options:                          â”‚
â”‚    â€¢ AWS (EC2 + RDS)                    â”‚
â”‚    â€¢ GCP (Cloud Run + Cloud SQL)        â”‚
â”‚    â€¢ Azure (App Service + Database)     â”‚
â”‚  Monitoring:                             â”‚
â”‚    â€¢ CloudWatch / DataDog / ELK Stack   â”‚
â”‚  Backup:                                 â”‚
â”‚    â€¢ Automated PostgreSQL Backups       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Architecture Pattern

### Layered Architecture (Backend)

```
   HTTP Request
        â†“
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ REST Controllers â”‚ (HTTP Layer)
   â”‚ @RestController  â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â†“
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  Service Layer   â”‚ (Business Logic)
   â”‚  @Service        â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â†“
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ Repository Layer â”‚ (Data Access)
   â”‚ extends JpaRepo  â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â†“
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  Entity Models   â”‚ (Domain)
   â”‚  @Entity         â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â†“
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚   PostgreSQL     â”‚ (Persistence)
   â”‚   Database       â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Security & JWT Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  User Login     â”‚
â”‚ (Email/Pwd)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AuthController.login()              â”‚
â”‚  Validates credentials               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  JwtTokenProvider                   â”‚
â”‚  Generates JWT (HS512)              â”‚
â”‚  Returns: accessToken + refreshTokenâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Frontend stores JWT                 â”‚
â”‚  localStorage.setItem('token', jwt) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  All API Requests                   â”‚
â”‚  Axios Interceptor adds:            â”‚
â”‚  Authorization: Bearer <jwt>        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  JwtAuthenticationFilter (Backend)  â”‚
â”‚  Extracts & validates JWT           â”‚
â”‚  Sets SecurityContext               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Secured Endpoint                   â”‚
â”‚  @PreAuthorize("isAuthenticated()") â”‚
â”‚  Processes request                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
    HTTP Response
```

### Frontend Component Architecture

```
App (Root Component)
â”œâ”€â”€ Router Setup
â”‚   â”œâ”€â”€ ProtectedRoute
â”‚   â”‚   â”œâ”€â”€ DashboardPage
â”‚   â”‚   â”œâ”€â”€ TasksPage
â”‚   â”‚   â”‚   â”œâ”€â”€ TaskList
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ TaskCard
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ TaskFilters
â”‚   â”‚   â”‚   â””â”€â”€ TaskForm
â”‚   â”‚   â”œâ”€â”€ SprintBoardPage
â”‚   â”‚   â”‚   â”œâ”€â”€ SprintBoard (Kanban)
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ TaskCard (draggable)
â”‚   â”‚   â”‚   â””â”€â”€ SprintStats
â”‚   â”‚   â””â”€â”€ ProfilePage
â”‚   â””â”€â”€ Public Routes
â”‚       â”œâ”€â”€ LoginPage
â”‚       â”‚   â””â”€â”€ LoginForm
â”‚       â””â”€â”€ RegisterPage
â”‚           â””â”€â”€ RegisterForm
â””â”€â”€ Global Components
    â”œâ”€â”€ Header
    â”œâ”€â”€ Navigation
    â””â”€â”€ ErrorBoundary
```

### Data Flow (Redux-like pattern with TanStack Query)

```
User Action (Click Create Task)
    â†“
Component Event Handler
    â†“
useMutation Hook (TanStack Query)
    â†“
Axios Request: POST /api/tasks
    â†“
Backend Service: TaskService.create()
    â†“
Database: INSERT INTO tasks
    â†“
Response: { success: true, data: Task }
    â†“
TanStack Query Updates Cache
    â†“
Component Re-renders with New Task
    â†“
UI Updates (optimistic + confirmed)
```

---

## Database Schema Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        users                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ id (UUID, PK)    â”‚ email        â”‚ password_hash        â”‚
â”‚ username         â”‚ full_name    â”‚ avatar_url          â”‚
â”‚ is_active        â”‚ created_at   â”‚ updated_at          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚
             â”‚ 1 â”€â”€â†’ M
             â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                                    â”‚
â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            sprints                       â”‚  â”‚        tasks                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ id (UUID, PK)    â”‚ user_id (FK â†’ users) â”‚  â”‚ id (UUID, PK)â”‚ user_id (FK)   â”‚
â”‚ name             â”‚ start_date           â”‚  â”‚ title        â”‚ sprint_id (FK) â”‚
â”‚ description      â”‚ end_date             â”‚  â”‚ description  â”‚ status         â”‚
â”‚ status           â”‚ created_at           â”‚  â”‚ priority     â”‚ due_date       â”‚
â”‚ updated_at       â”‚                      â”‚  â”‚ assigned_to  â”‚ created_at     â”‚
â”‚                  â”‚                      â”‚  â”‚ updated_at   â”‚                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â–²                                   â”‚
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€ 1 â”€â”€â†’ M â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Indexes:**
- `idx_users_email`: Fast email lookups
- `idx_sprints_user_status`: Sprint filtering by user
- `idx_tasks_sprint_status`: Kanban board queries
- `idx_tasks_user_status`: User task filtering
- `idx_tasks_due_date`: Due date sorting

---

## API Endpoint Summary

### Authentication Endpoints
```
POST   /api/auth/register      â†’ Register new user
POST   /api/auth/login         â†’ Login (returns JWT)
POST   /api/auth/refresh       â†’ Refresh access token
POST   /api/auth/logout        â†’ Logout (invalidate token)
GET    /api/auth/me            â†’ Get current user
```

### User Endpoints
```
GET    /api/users/{id}         â†’ Get user profile
PUT    /api/users/{id}         â†’ Update profile
PUT    /api/users/{id}/password â†’ Change password
```

### Task Endpoints
```
GET    /api/tasks              â†’ List user tasks (with filters)
GET    /api/tasks/{id}         â†’ Get task by ID
POST   /api/tasks              â†’ Create task
PUT    /api/tasks/{id}         â†’ Update task
DELETE /api/tasks/{id}         â†’ Delete task
PATCH  /api/tasks/{id}/status  â†’ Update status only
```

### Sprint Endpoints
```
GET    /api/sprints            â†’ List user sprints
GET    /api/sprints/{id}       â†’ Get sprint details
POST   /api/sprints            â†’ Create sprint
PUT    /api/sprints/{id}       â†’ Update sprint
GET    /api/sprints/{id}/tasks â†’ Get Kanban board data
GET    /api/sprints/{id}/stats â†’ Get sprint statistics
```

---

## File Organization

### Backend Directory Structure
```
backend/
â”œâ”€â”€ src/main/java/com/taskmanager/
â”‚   â”œâ”€â”€ TaskManagerApplication.java    (Entry point)
â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”œâ”€â”€ SecurityConfig.java
â”‚   â”‚   â”œâ”€â”€ CorsConfig.java
â”‚   â”‚   â””â”€â”€ JwtConfig.java
â”‚   â”œâ”€â”€ controller/
â”‚   â”‚   â”œâ”€â”€ AuthController.java
â”‚   â”‚   â”œâ”€â”€ UserController.java
â”‚   â”‚   â”œâ”€â”€ TaskController.java
â”‚   â”‚   â””â”€â”€ SprintController.java
â”‚   â”œâ”€â”€ service/
â”‚   â”‚   â”œâ”€â”€ AuthService.java
â”‚   â”‚   â”œâ”€â”€ UserService.java
â”‚   â”‚   â”œâ”€â”€ TaskService.java
â”‚   â”‚   â””â”€â”€ SprintService.java
â”‚   â”œâ”€â”€ repository/
â”‚   â”‚   â”œâ”€â”€ UserRepository.java
â”‚   â”‚   â”œâ”€â”€ TaskRepository.java
â”‚   â”‚   â””â”€â”€ SprintRepository.java
â”‚   â”œâ”€â”€ entity/
â”‚   â”‚   â”œâ”€â”€ User.java
â”‚   â”‚   â”œâ”€â”€ Task.java
â”‚   â”‚   â”œâ”€â”€ Sprint.java
â”‚   â”‚   â””â”€â”€ enums/
â”‚   â”‚       â”œâ”€â”€ TaskStatus.java
â”‚   â”‚       â”œâ”€â”€ TaskPriority.java
â”‚   â”‚       â””â”€â”€ SprintStatus.java
â”‚   â”œâ”€â”€ dto/
â”‚   â”‚   â”œâ”€â”€ request/
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginRequest.java
â”‚   â”‚   â”‚   â”œâ”€â”€ RegisterRequest.java
â”‚   â”‚   â”‚   â”œâ”€â”€ TaskCreateRequest.java
â”‚   â”‚   â”‚   â””â”€â”€ SprintCreateRequest.java
â”‚   â”‚   â”œâ”€â”€ response/
â”‚   â”‚   â”‚   â”œâ”€â”€ AuthResponse.java
â”‚   â”‚   â”‚   â”œâ”€â”€ TaskResponse.java
â”‚   â”‚   â”‚   â””â”€â”€ SprintResponse.java
â”‚   â”‚   â””â”€â”€ ApiResponse.java
â”‚   â”œâ”€â”€ security/
â”‚   â”‚   â”œâ”€â”€ JwtTokenProvider.java
â”‚   â”‚   â”œâ”€â”€ JwtAuthenticationFilter.java
â”‚   â”‚   â”œâ”€â”€ CustomUserDetails.java
â”‚   â”‚   â””â”€â”€ SecurityContextHelper.java
â”‚   â””â”€â”€ exception/
â”‚       â”œâ”€â”€ AppException.java
â”‚       â”œâ”€â”€ ResourceNotFoundException.java
â”‚       â”œâ”€â”€ UnauthorizedException.java
â”‚       â”œâ”€â”€ ForbiddenException.java
â”‚       â””â”€â”€ GlobalExceptionHandler.java
â”œâ”€â”€ src/main/resources/
â”‚   â”œâ”€â”€ application.yml
â”‚   â”œâ”€â”€ application-dev.yml
â”‚   â”œâ”€â”€ application-prod.yml
â”‚   â”œâ”€â”€ logback-spring.xml
â”‚   â””â”€â”€ db/migration/
â”‚       â”œâ”€â”€ V1__Create_users_table.sql
â”‚       â”œâ”€â”€ V2__Create_tasks_table.sql
â”‚       â”œâ”€â”€ V3__Create_sprints_table.sql
â”‚       â”œâ”€â”€ V4__Add_sprint_to_tasks.sql
â”‚       â”œâ”€â”€ V5__Create_audit_logs_table.sql
â”‚       â””â”€â”€ V6__Add_indexes.sql
â”œâ”€â”€ src/test/java/com/taskmanager/
â”‚   â”œâ”€â”€ service/
â”‚   â”‚   â”œâ”€â”€ AuthServiceTest.java
â”‚   â”‚   â”œâ”€â”€ TaskServiceTest.java
â”‚   â”‚   â””â”€â”€ SprintServiceTest.java
â”‚   â”œâ”€â”€ controller/
â”‚   â”‚   â”œâ”€â”€ AuthControllerTest.java
â”‚   â”‚   â”œâ”€â”€ TaskControllerTest.java
â”‚   â”‚   â””â”€â”€ SprintControllerTest.java
â”‚   â””â”€â”€ repository/
â”‚       â””â”€â”€ TaskRepositoryTest.java
â”œâ”€â”€ pom.xml
â”œâ”€â”€ Dockerfile
â”œâ”€â”€ .dockerignore
â””â”€â”€ README.md
```

### Frontend Directory Structure
```
frontend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ client.ts           (Axios instance)
â”‚   â”‚   â”œâ”€â”€ auth.ts             (Auth endpoints)
â”‚   â”‚   â”œâ”€â”€ tasks.ts            (Task endpoints)
â”‚   â”‚   â””â”€â”€ sprints.ts          (Sprint endpoints)
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
â”‚   â”‚   â”‚   â”œâ”€â”€ SprintBoard.tsx  (Kanban)
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
â”‚   â”‚   â”œâ”€â”€ useAuth.ts          (Auth context)
â”‚   â”‚   â”œâ”€â”€ useTasks.ts         (TanStack Query)
â”‚   â”‚   â”œâ”€â”€ useSprints.ts       (TanStack Query)
â”‚   â”‚   â””â”€â”€ useLocalStorage.ts
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ LoginPage.tsx
â”‚   â”‚   â”œâ”€â”€ RegisterPage.tsx
â”‚   â”‚   â”œâ”€â”€ DashboardPage.tsx
â”‚   â”‚   â”œâ”€â”€ TasksPage.tsx
â”‚   â”‚   â”œâ”€â”€ SprintBoardPage.tsx
â”‚   â”‚   â””â”€â”€ NotFoundPage.tsx
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â””â”€â”€ authStore.ts         (Zustand)
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â””â”€â”€ index.ts             (Interfaces)
â”‚   â”œâ”€â”€ App.tsx                  (Routes)
â”‚   â”œâ”€â”€ main.tsx
â”‚   â”œâ”€â”€ index.css
â”‚   â””â”€â”€ vite-env.d.ts
â”œâ”€â”€ public/
â”œâ”€â”€ index.html
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ vite.config.ts
â”œâ”€â”€ vitest.config.ts
â””â”€â”€ Dockerfile
```

---

## Key Dependencies Version Matrix

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Java | 21 | Runtime |
| Spring Boot | 3.2+ | Framework |
| Spring Security | 6.x | JWT Auth |
| Hibernate | 6.x | ORM |
| PostgreSQL Driver | 42.x | JDBC |
| JJWT | 0.12.x | JWT Tokens |
| Lombok | 1.18.x | Annotations |
| JUnit | 5.9.x | Testing |
| React | 18.2.x | UI |
| TypeScript | 5.1.x | Typing |
| Vite | 4.3.x | Build |
| Axios | 1.4.x | HTTP |
| TanStack Query | 4.29.x | State |
| Tailwind CSS | 3.3.x | Styling |

---

## Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| API Response Time (p95) | < 500ms | JMeter / Spring Boot Actuator |
| Database Query Time | < 50ms | PostgreSQL EXPLAIN ANALYZE |
| Frontend Load Time | < 3s | Lighthouse |
| Lighthouse Score | > 80 | Lighthouse |
| Core Web Vitals | Passing | PageSpeed Insights |
| Test Coverage (Backend) | 70%+ | JaCoCo |
| Test Coverage (Frontend) | 60%+ | Vitest/Istanbul |
| Docker Build Time | < 5min | Docker |
| Concurrent Users | 100+ | JMeter / Locust |

---

## Security Requirements

âœ“ HTTPS in production  
âœ“ JWT with HS512 algorithm  
âœ“ BCrypt password hashing (strength 12)  
âœ“ CORS whitelist for trusted domains  
âœ“ Secrets in environment variables  
âœ“ Input validation on all endpoints  
âœ“ SQL injection prevention (JPA parameterized)  
âœ“ XSS prevention (React escaping)  
âœ“ OWASP Top 10 compliance  
âœ“ Rate limiting on auth endpoints  
âœ“ Password requirements: 8+ chars, mixed case, numbers, special chars  
âœ“ Dependency vulnerability scanning (OWASP Dependency-Check)  
âœ“ Secure logging (no passwords/tokens)  

---

## Development Commands

### Backend
```bash
# Build
mvn clean package

# Run
mvn spring-boot:run

# Test
mvn test

# Coverage
mvn jacoco:report

# Docker
docker build -t taskmanager-backend .
```

### Frontend
```bash
# Install
npm install

# Develop
npm run dev

# Build
npm run build

# Test
npm test

# Coverage
npm run coverage

# Docker
docker build -t taskmanager-frontend .
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## Useful References

**Documentation:**
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Security: https://spring.io/projects/spring-security
- React: https://react.dev
- PostgreSQL: https://www.postgresql.org/docs

**Tools & Libraries:**
- Flyway: https://flywaydb.org
- JWT: https://jwt.io
- Tailwind: https://tailwindcss.com
- Docker: https://docker.com

---

**Version:** 1.0  
**Last Updated:** 2026-07-03
