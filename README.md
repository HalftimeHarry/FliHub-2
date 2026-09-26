# FLIHub

FLIHub is a sports operations platform for league management, business workflows, and fantasy/community features. This repository is a working monorepo prototype that combines:

- a TypeScript domain model for sports operations
- a local web dashboard for managing organization data
- a lightweight API layer for local development
- a set of domain packages for league, business, fantasy, and workflow logic

The goal is to evolve from a domain-first prototype into a real, multi-tenant sports platform with persistent data, user access controls, and operational tooling.

## What the app does today

The current application is a local demo workspace for managing an organization and core league/business data. It includes a left-sidebar dashboard shell and a set of operational modules for:

- organization switching and user context
- player management
- seasons and league lifecycle
- teams, tournaments, and registrations
- courses and holes
- fantasy leagues and draft tooling
- departments, projects, and reimbursement claims
- scoring and tournament setup workflows

This is not yet a production backend or a polished SaaS product, but it is a working interactive foundation for designing and validating domain workflows.

## Current product shape

### Web app
The web application lives under `apps/web` and includes:

- a responsive sidebar-based dashboard
- organization and user switching
- CRUD-style forms for major data objects
- scorekeeping and tournament setup panels
- fantasy league and draft interaction

### API layer
The API under `apps/api` exposes local mock data and domain workflows for development and testing. It is meant to support the frontend while the system evolves toward real persistence and authentication.

### Domain packages
The monorepo includes domain-specific modules for:

- `packages/core` — shared value objects, IDs, organizations, RBAC concepts
- `packages/league` — players, teams, seasons, tournaments, registrations, tees, scoring
- `packages/business` — claims, departments, projects, reimbursement logic
- `packages/fantasy` — fantasy league and team models
- `packages/workflows` — pipeline-style orchestration patterns
- `packages/persistence` — repository abstractions and in-memory support

## Repository layout

```text
apps/
  api/                 Local API and mock data layer
  web/                 React + Vite dashboard and app shell
packages/
  business/           Business domain workflows and models
  community/          Community domain boundary
  content/            Content/media boundary
  core/               Shared platform primitives
  fantasy/            Fantasy league logic
  league/             League and tournament workflows
  persistence/        Repository contracts and demos
  sponsorship/        Sponsorship domain placeholders
  workflows/          Generic workflow pipeline abstraction

docs/
  architecture.md
  business-domain.md
  community-domain.md
  development-guide.md
  domain-model.md
  league-domain.md
  pocketbase-future-integration.md
  roadmap.md
  workflows.md
```

## Running the app

Install dependencies:

```bash
npm install
```

Start the API and web app together:

```bash
npm run dev
```

Or run the individual workspace commands:

```bash
npm run dev --workspace=@flihub/api
npm run dev --workspace=@flihub/web
```

Run the checks:

```bash
npm run build
npm test
npm run lint
npm run format:check
```

## What we need to do next

This is the highest-priority roadmap for turning the prototype into a real platform.

### 1. Replace mock data with real persistence
- add a real database layer
- connect API operations to persisted entities instead of local in-memory mocks
- establish repository implementations for all major domains

### 2. Add authentication and authorization
- sign-in/sign-out flow
- role-based access control for organization admins, staff, scorekeepers, and players
- per-organization tenancy boundaries

### 3. Finish the core operational workflows
- tournament registration flow
- score entry and validation
- team/league management consistency checks
- claim submission and approval lifecycle

### 4. Tighten the app shell and UX
- real navigation patterns and layout polish
- better mobile behavior and accessibility
- more consistent table/form interactions
- improved error states and loading indicators

### 5. Add product-grade backend structure
- API validation
- logs and monitoring
- environment configuration
- deployment-ready build pipeline

### 6. Prepare for product expansion
- sponsorship and community content tools
- broader multi-tenant support
- reporting and analytics
- future integration with storage or CMS systems

## Recommended next milestone

The next useful milestone is to move from mock/demo data to a persisted, authenticated, organization-scoped platform with one end-to-end workflow working end-to-end, ideally:

1. create organization
2. create users
3. create season / tournaments
4. register players
5. score a tournament
6. view results in the dashboard

That will validate the architecture and give the team a clean foundation for building the full product.

## Notes

This project is intentionally structured as a domain-first prototype. The current codebase is valuable because it clarifies the business model, enforces TypeScript discipline, and gives the team a working starting point for designing a production-ready sports platform.

The next step is not to add more UI polish alone; it is to lock the real operational flows, persistence layer, and access model so the app can become a trustworthy product.
