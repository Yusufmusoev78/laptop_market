# 💎 Somon Comp (Сомон Комп)

Welcome to **Somon Comp** — Tajikistan's premier, state-of-the-art marketplace for high-end laptops, smartphones, and custom-built desktop PCs. 

This full-stack application is crafted with a highly responsive, custom-styled dark-mode Glassmorphism design and a robust, clean-architecture backend following Domain-Driven Design (DDD) principles.

---

## 🌟 Key Features

### 💻 📱 Segmented Market Switcher
* Located on the far-left of the navigation bar with high-end luxury background textures.
* Seamlessly switches the marketplace display between **Laptops**, **Phones**, and the **PC Builder** dashboard.
* Fully optimized for mobile screens, transforming into a touch-friendly, symmetrical icon-based segment selector.

### 🛠️ Interactive PC Builder (Сборка ПК)
* Step-by-step custom PC construction tool with scrollable category tabs (`<` and `>` arrow selectors).
* Real-time socket and RAM type compatibility validations (e.g., checks compatibility between chosen CPU and Motherboard).
* Live TDP power draw calculation and warnings if the power supply (PSU) capacity is exceeded.
* Integrated installment payment options showing monthly rates for providers like **Alif Salom** (Salom card) and **Halyk Bank**.

### 📷 AI Visual Search & Camera Integration
* Drag-and-drop or select-to-upload visual search for laptop/phone identification.
* Integrated live web camera scanning, featuring a real-time glowing green laser scan indicator to identify device models in seconds.

### 🌐 Multi-Language Support
* Toggle interface dynamically between three languages:
  * 🇹🇯 **Tajik (Тоҷикӣ)**
  * 🇷🇺 **Russian (Русский)**
  * 🇬🇧 **English**

### 🔐 Auth & Continue with Google
* Secure user profiles utilizing JWT tokens.
* Streamlined **Continue with Google** integration, retrieving profiles automatically.

---

## 🏗️ Technology Stack

| Component | Technology | Highlights |
| :--- | :--- | :--- |
| **Backend** | Python FastAPI | Blazing-fast REST API, Domain-Driven Design |
| **Database** | PostgreSQL | Robust relation mapping with async query support |
| **ORM** | SQLAlchemy 2.0 | Asynchronous DB session management |
| **Migrations** | Alembic | Versioned schema migration control |
| **Frontend** | React 18 & TypeScript | Type-safe, component-driven architecture |
| **Styling** | Vanilla CSS | Custom Glassmorphism, tailored gradients & dynamic layouts |
| **Icons** | Lucide React | High-quality, modern SVG icon library |

---

## 🚀 How to Run the Project Locally

### Step 1: Database Setup
1. Create a PostgreSQL database called `laptop_market`.
2. Open the `.env` file in the root directory (`~/comp_market/.env`) and update the `DATABASE_URL` with your credentials:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/laptop_market
   ```

### Step 2: Start the FastAPI Backend
Open a terminal and run the following setup commands:
```bash
cd ~/comp_market
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations to build the tables
alembic upgrade head

# Seed sample laptops and phones
python scripts/seed.py

# Start the uvicorn development server
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### Step 3: Start the React Frontend
Open a **separate terminal window**:
```bash
cd ~/comp_market/frontend
npm install
npm start
```
The React development server runs at **[http://localhost:5173](http://localhost:5173)**.

---

## 📂 Project Directory Structure

```
├── alembic/                 # Database schema migration scripts
├── scripts/
│   └── seed.py             # Database seeder for laptops, phones, and components
├── src/                    # FastAPI Clean Architecture source code
│   ├── api/                # REST endpoints and dependency injections
│   ├── core/               # Global config, JWT security, and exception handlers
│   ├── db/                 # Session creation & database engine
│   ├── models/             # SQLAlchemy model tables (User, Laptop, Component)
│   ├── repositories/       # Data Access Layer (CRUD queries)
│   ├── schemas/            # Pydantic v2 schemas for validations
│   └── services/           # Business Logic layer
├── frontend/               # React TypeScript frontend application
│   ├── public/             # Static files and assets
│   └── src/
│       ├── api/            # API call methods & interceptors
│       ├── components/
│       │   ├── layout/     # Navbar, Footer & side drawers
│       │   └── ui/         # Button, LaptopCard & CustomCursor
│       ├── context/        # Theme, Language & Auth Context providers
│       ├── pages/          # Home, Catalog, Admin & PCBuilder views
│       ├── App.tsx         # Main router setup
│       └── index.css       # Global design system & theme variables
```

---

## 🎨 Design System & Colors
* **Primary (Green)**: `#10b981` (Emerald green highlight)
* **Background Dark**: `#09090b` (Rich deep charcoal black)
* **Card Surface**: `rgba(24, 24, 27, 0.7)` (Translucent blur border cards)
* **Text Primary**: `#fafafa`
* **Typography**: Outfit, Inter, or System fallback sans-serif fonts.
