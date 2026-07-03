<!-- File responsibility: Documents how to configure, run, test, and deploy the TaskManager backend. -->
# TaskManager Backend

Spring Boot 3 REST API for the TaskManager application with JWT authentication, PostgreSQL persistence, and Kanban board functionality.

## Prerequisites

- Java 21+ (JDK)
- Maven 3.8+
- PostgreSQL 14+
- Docker & Docker Compose (for containerized setup)

On Windows, verify Maven is using Java 21+:

```powershell
mvn -version
```

If Maven reports Java 17 while a newer JDK is installed, set `JAVA_HOME` before building:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
mvn test
```

## Quick Start

### 1. Setup Environment

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager_db
DB_USER=taskmanager_user
DB_PASSWORD=taskmanager_password

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-minimum-64-characters-please
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Server Configuration
SERVER_PORT=8080
SPRING_PROFILE=dev

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Setup PostgreSQL (Option A: Docker)

```bash
docker run --name taskmanager-postgres \
  -e POSTGRES_DB=taskmanager_db \
  -e POSTGRES_USER=taskmanager_user \
  -e POSTGRES_PASSWORD=taskmanager_password \
  -p 5432:5432 \
  -d postgres:14-alpine
```

### 3. Setup PostgreSQL (Option B: Local Installation)

Create database and user:

```sql
CREATE DATABASE taskmanager_db;
CREATE USER taskmanager_user WITH PASSWORD 'taskmanager_password';
ALTER ROLE taskmanager_user WITH LOGIN;
GRANT ALL PRIVILEGES ON DATABASE taskmanager_db TO taskmanager_user;
```

### 4. Build & Run

#### Development Mode

```bash
# Build
mvn clean package

# Run with Spring Boot Maven plugin
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Or run JAR directly
java -jar target/task-manager-backend-1.0.0.jar --spring.profiles.active=dev
```

The application will:
- Auto-create database schema via Flyway migrations
- Run on `http://localhost:8080`
- API docs available at `http://localhost:8080/swagger-ui.html`

#### Docker Compose (Recommended)

```bash
# From project root
docker-compose up

# Services will be available:
# - PostgreSQL: localhost:5432
# - Backend API: http://localhost:8080
# - Frontend: http://localhost:3000
```

### 5. Verify Setup

```bash
# Check API health
curl http://localhost:8080/actuator/health

# View API documentation
curl http://localhost:8080/v3/api-docs
```

## Project Structure

```
backend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ main/
â”‚   â”‚   â”œâ”€â”€ java/com/taskmanager/
â”‚   â”‚   â”‚   â”œâ”€â”€ config/           # Security, CORS, JWT config
â”‚   â”‚   â”‚   â”œâ”€â”€ controller/       # REST endpoints
â”‚   â”‚   â”‚   â”œâ”€â”€ service/          # Business logic
â”‚   â”‚   â”‚   â”œâ”€â”€ repository/       # Data access (JPA)
â”‚   â”‚   â”‚   â”œâ”€â”€ entity/           # Domain models
â”‚   â”‚   â”‚   â”œâ”€â”€ dto/              # Request/Response DTOs
â”‚   â”‚   â”‚   â”œâ”€â”€ security/         # JWT, authentication
â”‚   â”‚   â”‚   â”œâ”€â”€ exception/        # Custom exceptions & handlers
â”‚   â”‚   â”‚   â””â”€â”€ TaskManagerApplication.java
â”‚   â”‚   â””â”€â”€ resources/
â”‚   â”‚       â”œâ”€â”€ application.yml
â”‚   â”‚       â”œâ”€â”€ application-dev.yml
â”‚   â”‚       â”œâ”€â”€ application-prod.yml
â”‚   â”‚       â”œâ”€â”€ application-test.yml
â”‚   â”‚       â”œâ”€â”€ logback-spring.xml
â”‚   â”‚       â””â”€â”€ db/migration/     # Flyway SQL scripts
â”‚   â””â”€â”€ test/java/com/taskmanager/
â”‚       â”œâ”€â”€ service/
â”‚       â”œâ”€â”€ controller/
â”‚       â””â”€â”€ repository/
â”œâ”€â”€ Dockerfile
â”œâ”€â”€ .dockerignore
â”œâ”€â”€ .gitignore
â”œâ”€â”€ pom.xml
â””â”€â”€ README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update profile
- `PUT /api/users/{id}/password` - Change password

### Tasks
- `GET /api/tasks` - List tasks (paginated, filterable)
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/status` - Update task status

### Sprints
- `GET /api/sprints` - List sprints
- `GET /api/sprints/{id}` - Get sprint
- `POST /api/sprints` - Create sprint
- `PUT /api/sprints/{id}` - Update sprint
- `GET /api/sprints/{id}/tasks` - Get Kanban board
- `GET /api/sprints/{id}/stats` - Get sprint statistics

## Testing

```bash
# Run all tests
mvn test

# Run with coverage report
mvn test jacoco:report
# View report at: target/site/jacoco/index.html

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Run with verbose output
mvn test -X
```

## Database Migrations

Migrations are automatically applied on startup via Flyway.

### Manual Migration Commands

```bash
# View applied migrations
psql -h localhost -U taskmanager_user -d taskmanager_db
SELECT * FROM flyway_schema_history;

# Redo migration (careful!)
mvn flyway:clean flyway:migrate
```

## Configuration Profiles

### Development (`dev`)
- H2 in-memory or local PostgreSQL
- Debug logging enabled
- All actuator endpoints exposed
- Loose CORS settings

### Production (`prod`)
- PostgreSQL required
- Minimal logging (WARN level)
- Only essential actuator endpoints
- Strict CORS configuration
- JWT secret from environment variable

### Test (`test`)
- H2 in-memory database
- Flyway disabled
- Create-drop schema

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SPRING_PROFILE | dev | Active Spring profile |
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | taskmanager_db | Database name |
| DB_USER | taskmanager_user | Database user |
| DB_PASSWORD | taskmanager_password | Database password |
| JWT_SECRET | (dev default) | JWT signing key (64+ chars for HS512) |
| JWT_EXPIRATION | 900000 | Access token TTL (ms) |
| JWT_REFRESH_EXPIRATION | 604800000 | Refresh token TTL (ms) |
| SERVER_PORT | 8080 | Server port |
| CORS_ALLOWED_ORIGINS | localhost:3000,localhost:5173 | CORS whitelist |

## Security

- **JWT Authentication**: Stateless, HS512 signed
- **Password Hashing**: BCrypt (Spring Security default)
- **CORS**: Configurable whitelist
- **Input Validation**: Bean Validation annotations
- **SQL Injection Prevention**: Spring Data JPA parameterized queries

## Logging

Logs are written to:
- **Console**: Real-time output
- **File**: `logs/taskmanager.log` with rolling policy (10MB files, 30-day retention)

Configure via `logback-spring.xml`

## Troubleshooting

### PostgreSQL Connection Refused
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check credentials
psql -h localhost -U taskmanager_user -d taskmanager_db
```

### Port Already in Use
```bash
# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### Flyway Migration Failed
```bash
# Check migration syntax
cat src/main/resources/db/migration/V*.sql

# Manual rollback (if needed)
mvn flyway:clean
```

### JWT Token Invalid
- Verify JWT_SECRET matches between requests
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

## Performance Tips

- Database indexes are applied via Flyway (V5__Add_indexes.sql)
- JPA query optimization with proper fetch strategies
- Connection pooling (HikariCP) configured
- Response compression enabled for bodies > 1KB

## Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **Health Check**: http://localhost:8080/actuator/health
- **Metrics**: http://localhost:8080/actuator/metrics

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: your feature"`
3. Write tests with 75%+ coverage
4. Run: `mvn test jacoco:report`
5. Push: `git push origin feature/your-feature`
6. Create pull request
7. After approval, merge to main

## Deployment

### Docker
```bash
# Build image
docker build -t taskmanager-backend:latest .

# Run container
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e JWT_SECRET=your-secret-key-change-in-production-minimum-64-characters-please \
  -e DB_HOST=postgres-host \
  taskmanager-backend:latest
```

### Cloud Deployment
See [deployment guide](../../DEPLOYMENT.md) for AWS/GCP/Azure instructions.

## Contributing

1. Follow Spring Boot best practices
2. Use Lombok to reduce boilerplate
3. Write tests for new features
4. Maintain 75%+ code coverage
5. Follow commit conventions

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-03
