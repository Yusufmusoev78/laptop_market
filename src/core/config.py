from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Somon Comp"
    API_V1_STR: str = "/api/v1"

    # CORS - explicit origins required because allow_credentials=True
    # (browsers reject a wildcard origin combined with credentials)
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/laptop_market"

    # Security
    SECRET_KEY: str = "SUPER-SECRET-KEY-CHANGE-IN-PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @model_validator(mode="after")
    def validate_database_url(self) -> "Settings":
        if self.DATABASE_URL.startswith("postgresql://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self

settings = Settings()

