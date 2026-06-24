# comp_market Workspace Rules

## Architecture & Design
- **Framework**: Python FastAPI.
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async preferred) and Alembic for migrations.
- **Architecture**: Domain-Driven Design (DDD) or Clean Architecture. Separate routes (API layer), services (business logic layer), and repositories (data access layer).
- **Schemas**: Pydantic v2 for data validation, serialization, and deserialization.

## Clean Code & Quality
- **Formatting & Linting**: Use `ruff` for fast linting and formatting. Use `mypy` for static type checking.
- **Typing**: Strongly type all function signatures, including return types.
- **Principles**: Adhere to SOLID principles and DRY. Keep functions small and focused on a single responsibility.
- **Error Handling**: Use custom HTTP exceptions and centralized exception handlers in FastAPI. Do not expose internal database errors to the client.

## API Design & Documentation
- Ensure Swagger/ReDoc documentation is comprehensive with clear descriptions, tags, and example responses.
- Keep RESTful URL patterns for endpoints.
  