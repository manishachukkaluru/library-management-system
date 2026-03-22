# 📚 Library Management System

A full-stack Library Management System built with **Spring Boot 3**, **Angular 17**, **Oracle DB**, **JWT authentication**, and a **GitHub Actions CI/CD pipeline**.

---

## 🏗️ Architecture

```
library-management-system/
├── backend/                    # Spring Boot 3 API
│   ├── src/main/java/com/library/
│   │   ├── config/             # Security, OpenAPI, Application config
│   │   ├── controller/         # REST controllers (Books, Members, Borrowings, Auth, Dashboard)
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities (Book, Member, BorrowingRecord, User)
│   │   ├── exception/          # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JwtService, JwtAuthenticationFilter
│   │   ├── service/            # Service interfaces + implementations
│   │   └── util/               # Utility classes
│   ├── src/main/resources/
│   │   ├── application.yml     # App config (Oracle, JWT, Swagger, Logging)
│   │   └── db/migration/       # Flyway SQL migrations (V1, V2)
│   ├── Dockerfile              # Multi-stage Docker build
│   └── pom.xml
├── frontend/                   # Angular 17 SPA
│   ├── src/app/
│   │   ├── core/               # Guards, interceptors, models, services
│   │   ├── features/           # Auth, Books, Members, Borrowings, Dashboard
│   │   └── shared/             # Layout component
│   └── src/styles.scss         # Global theme
├── .github/workflows/ci-cd.yml # GitHub Actions CI/CD (5 stages)
├── docker-compose.yml          # Oracle + Backend + Frontend
├── nginx.conf                  # Nginx config for Angular SPA
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17 (Temurin / OpenJDK)
- Node.js 20+
- Oracle Database XE (or Docker)
- Maven 3.9+
- IntelliJ IDEA (recommended)

### 1. Database Setup (Oracle)
```sql
-- Run as SYSDBA
CREATE USER library_user IDENTIFIED BY library_pass;
GRANT CONNECT, RESOURCE, CREATE SESSION TO library_user;
GRANT UNLIMITED TABLESPACE TO library_user;
```
Flyway will automatically run the migration scripts on first startup.

### 2. Backend (Spring Boot)
```bash
cd backend

# Set environment variables (or update application.yml)
export DB_USERNAME=library_user
export DB_PASSWORD=library_pass
export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Run
mvn spring-boot:run
```
API available at: http://localhost:8080/api  
Swagger UI: http://localhost:8080/api/swagger-ui.html

### 3. Frontend (Angular)
```bash
cd frontend
npm install
npm start          # Starts at http://localhost:4200
```

### 4. Docker Compose (All-in-one)
```bash
docker compose up -d oracle    # Wait ~2 minutes for Oracle to initialise
docker compose up -d backend
npm run build:prod             # Build Angular first
docker compose up -d frontend
```

---

## 🔐 Default Credentials

| Role       | Username    | Password    |
|------------|-------------|-------------|
| Admin      | `admin`     | `Admin@123` |
| Librarian  | `librarian` | `Lib@12345` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | `/auth/login`     | Login, receive JWT  |
| POST   | `/auth/register`  | Register new user   |

### Books
| Method | Endpoint                     | Description             |
|--------|------------------------------|-------------------------|
| GET    | `/books`                     | Paginated book list     |
| GET    | `/books/search`              | Search books            |
| GET    | `/books/{id}`                | Get by ID               |
| GET    | `/books/isbn/{isbn}`         | Get by ISBN             |
| GET    | `/books/available`           | Available books only    |
| POST   | `/books`                     | Create book             |
| PUT    | `/books/{id}`                | Update book             |
| PATCH  | `/books/{id}/discontinue`    | Soft delete             |
| DELETE | `/books/{id}`                | Hard delete (Admin)     |

### Members
| Method | Endpoint                     | Description             |
|--------|------------------------------|-------------------------|
| GET    | `/members`                   | Paginated member list   |
| GET    | `/members/search`            | Search members          |
| GET    | `/members/{id}`              | Get by ID               |
| POST   | `/members`                   | Create member           |
| PUT    | `/members/{id}`              | Update member           |
| PATCH  | `/members/{id}/suspend`      | Suspend member          |
| PATCH  | `/members/{id}/activate`     | Activate member         |
| DELETE | `/members/{id}`              | Delete (Admin)          |

### Borrowings
| Method | Endpoint                     | Description             |
|--------|------------------------------|-------------------------|
| GET    | `/borrowings`                | All borrowings          |
| GET    | `/borrowings/overdue`        | Overdue list            |
| GET    | `/borrowings/member/{id}`    | By member               |
| POST   | `/borrowings/borrow`         | Issue book              |
| PUT    | `/borrowings/{id}/return`    | Return book             |
| PUT    | `/borrowings/{id}/renew`     | Renew (max 2x)          |

### Dashboard
| Method | Endpoint              | Description   |
|--------|-----------------------|---------------|
| GET    | `/dashboard/stats`    | Stats summary |

---

## 🧪 Running Tests
```bash
# Backend tests + coverage report
cd backend
mvn test
# Report: target/site/jacoco/index.html

# Frontend tests
cd frontend
npm test
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The pipeline in `.github/workflows/ci-cd.yml` has **5 stages**:

| Stage              | Trigger              | Description                        |
|--------------------|----------------------|------------------------------------|
| `backend-test`     | Every push/PR        | Maven build + JaCoCo coverage      |
| `frontend-test`    | Every push/PR        | npm CI + Angular build + Karma     |
| `build-docker`     | `main` / `develop`   | Build & push Docker image to GHCR  |
| `deploy-staging`   | `develop` branch     | Auto-deploy to staging environment |
| `deploy-production`| `main` branch        | Deploy to prod + GitHub Release    |

### Required Secrets
```
STAGING_HOST, STAGING_USER, STAGING_SSH_KEY
STAGING_DB_USER, STAGING_DB_PASS, STAGING_JWT_SECRET
PROD_HOST, PROD_USER, PROD_SSH_KEY
PROD_DB_USER, PROD_DB_PASS, PROD_JWT_SECRET
```

---

## 🏛️ Design Principles (SOLID)

| Principle | Implementation                                                              |
|-----------|-----------------------------------------------------------------------------|
| **S**RP   | Each service class handles one domain (BookService, MemberService, etc.)   |
| **O**CP   | Service interfaces allow new implementations without modifying callers     |
| **L**SP   | All service implementations are interchangeable with their interfaces      |
| **I**SP   | Separate service interfaces (BookService, MemberService, BorrowingService) |
| **D**IP   | Controllers depend on service interfaces, not concrete implementations     |

---

## 📋 Features

- ✅ JWT Authentication (access + refresh tokens)
- ✅ Role-based access (ADMIN / LIBRARIAN)
- ✅ Books CRUD with search, filter, pagination
- ✅ Members management with membership types
- ✅ Book borrowing, return, renewal (max 2 renewals)
- ✅ Automatic overdue detection + fine calculation (₹5/day)
- ✅ Scheduled daily job to mark overdue borrowings
- ✅ Oracle database with Flyway migrations
- ✅ Swagger UI with JWT auth
- ✅ Structured JSON error responses
- ✅ Comprehensive logging (file + console)
- ✅ Docker + Docker Compose support
- ✅ GitHub Actions CI/CD with 5 stages
- ✅ JaCoCo test coverage reports
- ✅ Angular Material UI with clean design
