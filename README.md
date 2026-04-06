## ENSTO Sales Tool

Internal sales/support tool for configuring ENSTO-style systems, calculating material lists, and managing project history.

### Project structure

- `frontend/` – Next.js (App Router) UI, TypeScript, Tailwind CSS, TanStack Query
- `backend/` – FastAPI + SQLModel monolith API
- `docker/` – Dockerfiles and `docker-compose.yml` for local dev
- `docs/` – architecture and design notes

See `docs/ARCHITECTURE.md` for a more detailed architecture overview.

### Prerequisites

For Docker-based local development:

- Docker and Docker Compose plugin

For running services individually (optional):

- Node.js 20+
- Python 3.12+
- PostgreSQL 15/16

### Quick start (recommended – Docker)

From the repository root:

```bash
cd docker
docker compose up --build
```

This will start:

- `db` – PostgreSQL on `localhost:5432`
- `backend` – FastAPI API on `http://localhost:8000`
- `frontend` – Next.js app on `http://localhost:3000`

#### Seeding demo data

With the Docker stack running:

```bash
cd docker
docker compose exec backend python -m app.seed.cli
```

This loads the product catalogue from `backend/data/products.csv` (only if the `product` table is empty) and creates the showcase **Danderydsjukhus** demo project once if it does not already exist.

**Important:** Re-running this command is **idempotent** — it does **not** delete your projects or wipe the catalogue when data already exists. Previously, the seed script deleted all projects and all products on every run, which looked like “data lost after restart” if you re-seeded after starting the stack.

To **fully reset** the database (destructive), remove the Docker volume and bring the stack up again, e.g. `docker compose down -v` from the `docker/` directory, then run migrations/init and seed once on a clean DB.

### Core flows (v1)

Once containers are up and seed has been run:

1. Open `http://localhost:3000`
2. **Create a project**
   - Dashboard → “New Project” or Projects → “New Project”
3. **Open the project**
   - From Dashboard “Recent projects” or Projects list
4. **Add/configure a system**
   - On the project detail page, fill in the “Configure system” form (channel-type system) and click:
     - “Save system in project” to persist the system
     - “Calculate material list” to call the backend `/estimates/calculate` endpoint
5. **Save estimate**
   - After calculation, click “Save estimate” to persist via `/estimates`
6. **Browse products**
   - Navigate to Product finder in the top navigation and use search/filters

### Backend details

- Entry point: `backend/app/main.py` (`app` ASGI instance exposed via `backend/app/__init__.py`)
- Models:
  - `Product`, `ProductRelation`
  - `Project`, `ProjectSystem`
  - `Estimate`, `EstimateRow`
- Layers:
  - `core/` – settings and async DB engine/session
  - `models/` – SQLModel tables
  - `schemas/` – Pydantic DTOs for API
  - `repositories/` – DB access
  - `services/` – business logic:
    - `CalculationService` handles channel-like system material calculation
  - `routes/` – FastAPI routers:
    - `/products`, `/products/search`, `/products/{id}`
    - `/projects`, `/projects/{id}`
    - `/projects/{project_id}/systems`
    - `/estimates/calculate`, `/estimates`, `/estimates/{id}`
  - `seed/` – demo data and CLI entry point (`python -m app.seed.cli`)

Configuration:

- Copy `backend/.env.example` to `backend/.env` (optional when using Docker; Docker Compose already passes `DATABASE_URL`).

### Frontend details

- Next.js 16 App Router in `frontend/src/app`
  - `/` – Dashboard (quick new project, recent projects)
  - `/projects` – Projects list
  - `/projects/new` – New project form
  - `/projects/[id]` – Project detail:
    - project metadata
    - systems list
    - configurable channel system form
    - calculate + material list display
    - save estimate
  - `/products` – Product finder with search and filters
- API integration:
  - `src/lib/api-client.ts` – simple `apiGet`/`apiPost` wrappers with `NEXT_PUBLIC_API_BASE_URL`
  - `src/lib/api-types.ts` – typed request/response models
  - `src/lib/query-client.tsx` – TanStack Query client provider
  - `src/hooks/` – `useProjects`, `useProducts`, `useEstimates`
- UI:
  - `src/components/ui.tsx` – industrial-style cards, buttons, inputs, layouts
  - Light blue/white/grey palette, minimal chrome, no animations

For local non-Docker runs, create `frontend/.env.local` from the example:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Then:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

cd ../frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` by default.

### Linting and formatting

- **Backend**: `black`, `isort`, `flake8` in `backend/requirements.txt`
- **Frontend**: Next.js ESLint config (`npm run lint`)

You can integrate these into your editor or CI as needed.

