# Somon Comp

Welcome to **Somon Comp** — Tajikistan's marketplace for premium laptops, priced in somoni. This is a modern, full-stack web application with a premium user interface and a robust, clean-architecture backend.

## 🏗️ Project Architecture

This project is divided into two distinct parts: a **Python FastAPI Backend** and a **React TypeScript Frontend**.

### 1. The Backend (`src/` & `alembic/`)
The backend is built with Python using **FastAPI** for blazing-fast API performance. It follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to keep the code highly maintainable.

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy 2.0 (Asynchronous)
- **Migrations:** Alembic
- **Validation:** Pydantic v2
- **Structure:**
  - `src/api/` - The RESTful endpoints (routes).
  - `src/services/` - The business logic.
  - `src/repositories/` - The data access layer (interacting with the database).
  - `src/models/` - The SQLAlchemy database tables (`User`, `Laptop`).
  - `src/schemas/` - The Pydantic models for request/response validation.
  - `src/core/` - Configuration, security, and exception handling.

### 2. The Frontend (`frontend/`)
The frontend is a modern **React** application written in **TypeScript**, bootstrapped with **Create React App** (Webpack) for maximum compatibility across operating systems.

- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Premium Custom CSS (Glassmorphism, Deep Dark Mode, Gold/Emerald Accents).
- **Animations:** `framer-motion` (Features a custom animated cursor on desktop).
- **Routing:** `react-router-dom`
- **Structure:**
  - `frontend/src/components/ui/` - Reusable UI elements (Buttons, Laptop Cards, Custom Cursor).
  - `frontend/src/components/layout/` - Layout elements like the Navbar and Footer.
  - `frontend/src/pages/` - Full page views (Home, Catalog).
  - `frontend/src/api/` - Axios API clients to communicate with the FastAPI backend.

---

## 🚀 How to Run the Project

To run this application on your local machine, you need to start both the backend server and the frontend server.

### Step 1: Configure the Database
Before starting the backend, you must configure your PostgreSQL connection.
1. Open the `.env` file in the root directory (`~/comp_market/.env`).
2. Update the `DATABASE_URL` with your actual PostgreSQL password:
   `postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/laptop_market`

### Step 2: Start the Backend (FastAPI)
Open a terminal and run the following commands to set up the virtual environment and start the server:

```bash
cd ~/comp_market
python3 -m venv venv          # only needed the first time
source venv/bin/activate
pip install -r requirements.txt

# Apply database migrations (creates the tables in PostgreSQL)
alembic upgrade head

# Optional: populate the catalog with sample laptops
python scripts/seed.py

# Start the API server
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
You can view the interactive API documentation at: **[http://localhost:8000/docs](http://localhost:8000/docs)**

### Step 3: Start the Frontend (React UI)
Open a **new, separate terminal window** and run the following commands to start the React development server:

```bash
cd ~/comp_market/frontend

# Install dependencies (only needed the first time)
npm install

# Start the development server
npm start
```
The UI runs at: **[http://localhost:5173](http://localhost:5173)** (configured via the `PORT` env var in `package.json`).

---

## 🎨 Design Philosophy
Somon Comp uses a dark, glassmorphism-driven interface with a gold and emerald accent palette. A custom animated cursor (desktop only) and subtle motion add a premium feel without getting in the way on touch devices.

---

## 📂 Directory Structure (For AI Agents)
This section is a detailed map of the codebase for other AI agents to quickly understand the structure, file locations, and responsibilities of each module.

### Root Directory
- `README.md` - Project overview and instructions.
- `requirements.txt` - Pinned backend Python dependencies.
- `.env` - Environment variables (e.g., Database URL, Secret Keys).
- `alembic.ini` - Configuration for Alembic database migrations.
- `scripts/seed.py` - Idempotent script that seeds sample laptops into an empty database.

### 1. Backend (`/src` & `/alembic`)
The backend strictly follows Domain-Driven Design and Clean Architecture patterns.

- `/alembic/` - Database migrations folder.
  - `env.py` - The script that connects Alembic to the SQLAlchemy async engine.
  - `versions/` - Contains the individual migration scripts.
- `/src/` - The main Python backend source code.
  - `main.py` - The FastAPI entry point. Mounts routers and handles app lifecycle.
  - `/core/` - Global settings and configuration.
    - `config.py` - Pydantic BaseSettings class reading from `.env`.
    - `security.py` - Password hashing (bcrypt) and JWT token generation.
    - `exceptions.py` - Custom HTTP exceptions.
  - `/db/` - Database connection and session management.
    - `session.py` - Async engine and `get_db` dependency.
  - `/models/` - SQLAlchemy Declarative Base models (Database Tables).
    - `base.py` - The declarative base class.
    - `user.py`, `laptop.py` - Database table definitions.
  - `/schemas/` - Pydantic models (Data Transfer Objects).
    - `user.py`, `laptop.py` - Request/Response validation models.
  - `/repositories/` - Data Access Layer. Contains raw SQL/SQLAlchemy queries.
    - `base.py` - Generic CRUD operations.
    - `user.py`, `laptop.py` - Specific database queries.
  - `/services/` - Business Logic Layer. Connects routers to repositories.
    - `user.py`, `laptop.py` - Handlers for logic, hashing, and formatting.
  - `/api/` - The REST API Layer.
    - `dependencies.py` - Reusable FastAPI dependencies (e.g., `get_current_user`).
    - `/routes/` - The API endpoints (e.g., `users.py`, `laptops.py`).

### 2. Frontend (`/frontend`)
A React application bootstrapped with Create React App and configured with TypeScript.

- `/frontend/package.json` - Frontend dependencies and scripts (CRA).
- `/frontend/.env` - Frontend environment variables.
- `/frontend/public/` - Static files.
  - `index.html` - The HTML template for the React app.
- `/frontend/src/` - The main React source code.
  - `index.tsx` - The React DOM render entry point.
  - `index.css` - Global CSS variables, reset, and dark-mode styling.
  - `App.tsx` - The root component configuring `react-router-dom` routing.
  - `App.css` - Main layout wrapper styling.
  - `/api/` - Axios clients for backend communication.
    - `client.ts` - Configured Axios instance with interceptors.
    - `laptops.ts` - API calls for laptop resources.
  - `/components/layout/` - Structural components.
    - `Navbar.tsx` - Top navigation bar.
    - `Footer.tsx` - Site footer.
  - `/components/ui/` - Reusable, isolated UI components.
    - `Button.tsx` / `Button.css` - Styled interactive buttons.
    - `LaptopCard.tsx` / `LaptopCard.css` - Glassmorphism cards displaying laptop data.
    - `CustomCursor.tsx` / `CustomCursor.css` - A `framer-motion` animated cursor (disabled on touch devices).
  - `/pages/` - Full-page React components mapped to routes.
    - `Home.tsx` - Landing page with hero section and feature highlights.
    - `Catalog.tsx` - Display page for the list of laptops from the database.
