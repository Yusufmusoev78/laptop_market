# Tajikistan Laptop Market

A high-performance backend architecture for a Tajikistan-based laptop market. Built using **Domain-Driven Design (DDD)** and **Clean Architecture** principles to ensure maximum scalability and maintainability.

## Technology Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0 (Async)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT & Passlib (bcrypt)

## Directory Structure
```
src/
├── api/            # FastAPI routes and dependencies
├── core/           # Config, security, exceptions
├── db/             # Database connection, session management
├── models/         # SQLAlchemy models (Database schema)
├── repositories/   # Database access layer
├── schemas/        # Pydantic models (Input/Output validation)
└── services/       # Business logic
```

## Getting Started

### 1. Prerequisites
- Python 3.10+
- PostgreSQL server running locally or remotely.

### 2. Setup
Create a virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
pip install "fastapi[standard]" "sqlalchemy[asyncio]" alembic asyncpg pydantic-settings "passlib[bcrypt]" "python-jose[cryptography]"
```

### 3. Database Configuration
Update your database configuration in `src/core/config.py` (or via a `.env` file) to match your PostgreSQL instance:
```python
DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/laptop_market"
```

### 4. Database Migrations
Generate and apply migrations using Alembic:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 5. Running the Application
Start the FastAPI server using Uvicorn:
```bash
uvicorn src.main:app --reload
```
You can access the interactive API documentation (Swagger UI) at `http://localhost:8000/docs`.

## Key Features
- **Clean Architecture**: Strong separation of concerns between API routing, business logic, and database access.
- **Async First**: Non-blocking asynchronous endpoints and database queries utilizing Asyncpg.
- **Strict Typing**: Type safety using Python type hints and Pydantic validation.
- **Pre-configured Auth**: Ready-to-use JWT-based authentication system.
