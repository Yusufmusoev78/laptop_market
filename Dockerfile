# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with Static Files
FROM python:3.11-slim
WORKDIR /app

# Install postgres system library dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and config files
COPY alembic.ini .
COPY alembic/ ./alembic
COPY src/ ./src
COPY scripts/ ./scripts

# Copy frontend built static files
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Railway provides a dynamic port, expose it
EXPOSE 8000

# Start command: run Alembic migrations, then start FastAPI application
CMD alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port $PORT
