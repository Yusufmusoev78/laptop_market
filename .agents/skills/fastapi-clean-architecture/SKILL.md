---
name: fastapi-clean-architecture
description: Guidelines and instructions for building a FastAPI application using Clean Architecture, Pydantic v2, and SQLAlchemy.
---
# FastAPI Clean Architecture Skill

This skill guides the development of the FastAPI application in this workspace.

## Core Guidelines

1.  **Directory Structure**:
    Use a structured layout:
    ```
    src/
      api/            # FastAPI routers, dependencies
        routes/
        dependencies.py
      core/           # Config, security, exceptions
        config.py
        security.py
      models/         # SQLAlchemy models (Database schema)
      schemas/        # Pydantic models (Input/Output validation)
      services/       # Business logic
      repositories/   # Database access layer
      db/             # Database connection, session management
    ```

2.  **API Layer (Routers)**:
    - Routers should only handle HTTP concerns (parsing input, calling services, returning responses).
    - No business logic or direct database queries in route handlers.
    - Keep endpoints concise and well-documented with docstrings and type hints.

3.  **Service Layer (Business Logic)**:
    - Contains the core business rules and orchestration logic.
    - Operates on Pydantic schemas and delegates data persistence to the repository layer.
    - Services should be designed so that they can be easily tested without a database connection when mocking the repository.

4.  **Repository Layer (Data Access)**:
    - The only layer that interacts directly with SQLAlchemy models and the database session.
    - Abstract database operations away from services. Provide methods like `get_by_id`, `create`, `update`, etc.

5.  **Schemas (Pydantic v2)**:
    - Keep separate schemas for Create, Update, Read (Response), and DB representation if needed.
    - Use `model_config = ConfigDict(from_attributes=True)` for returning ORM models as responses so Pydantic can read data even if it's not a dict.
