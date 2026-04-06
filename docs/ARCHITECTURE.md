## ENSTO Sales Tool – Architecture Overview

This project is a backend-first monolith with a separated Next.js frontend.

- **Backend**: FastAPI + SQLModel + PostgreSQL
  - `core`: configuration and async DB session (`config.py`, `db.py`)
  - `models`: SQLModel tables (`product.py`, `project.py`)
  - `schemas`: Pydantic request/response contracts
  - `repositories`: DB access per aggregate (products, projects, systems, estimates)
  - `services`: business logic (project management, product lookups, estimate calculation)
  - `routes`: thin FastAPI routers delegating into services
  - `seed`: demo/seed dataset and CLI entrypoint

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + TanStack Query
  - `src/app`: routes for dashboard, projects, product finder
  - `src/components`: reusable layout and form primitives
  - `src/lib`: typed API client, React Query provider, shared TS types
  - `src/hooks`: feature-specific query/mutation hooks

### Domain Model

- **Product** and **ProductRelation** represent ENSTO catalogue items and relationships (e.g. channel ↔ lid, corners, tees, end caps).
- **Project** groups customer-specific work.
- **ProjectSystem** represents a configured system instance inside a project (e.g. one channel run).
- **Estimate** aggregates one material list for a given system.
- **EstimateRow** stores a snapshot of product and quantity information at the time of estimation.

The initial calculation flow is implemented for a channel-like system but the service layer is structured so additional system types can be plugged in later.

