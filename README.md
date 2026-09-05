# FLIHub

FLIHub is a modular sports technology platform foundation for FGL league operations, business management, community programs, and future multi-tenant licensing. This repository intentionally starts with architecture, TypeScript standards, domain boundaries, and small proof-of-concept workflows rather than a complete product.

## What this first foundation includes

- Strict TypeScript, npm workspaces, Zod, Vitest, ESLint, and Prettier.
- A Codespaces-ready `.devcontainer/devcontainer.json` using Node LTS tooling.
- Monorepo-ready packages under `packages/` for Core, Workflows, Persistence, League, Business, and Community boundaries.
- Documentation under `docs/` describing the architecture, domain model, development guide, workflows, roadmap, and future PocketBase isolation.
- Small League and Business proof-of-concept domain models and typed workflows.

## What this foundation intentionally excludes

There is no backend, database, authentication provider, REST API, GraphQL API, UI, PocketBase integration, Firebase, Supabase, Prisma, or SQL. Domain objects remain framework-independent so a professional engineering team can later add infrastructure without coupling it to the business model.

## Getting started

```bash
npm install
npm run build
npm run lint
npm test
npm run format:check
```

Open the repository in GitHub Codespaces for the recommended development environment.

## Repository layout

```text
.devcontainer/          Codespaces configuration
apps/                   Reserved for future application surfaces
docs/                   Architecture and domain documentation
packages/core           Shared value objects, identifiers, organizations, and errors
packages/workflows      Lightweight typed pipeline abstraction
packages/persistence    Persistence contracts and in-memory demonstration adapters
packages/league         FLIHub League proof-of-concept domain and workflow
packages/business       FLIHub Business proof-of-concept domain and workflow
packages/community      Community boundary placeholder
```

Start with `docs/architecture.md` for the platform overview.
