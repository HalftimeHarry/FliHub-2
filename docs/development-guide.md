# Development Guide

## Standards

Use TypeScript with strict compiler settings. Avoid `any`, prefer explicit names, keep classes focused, and use readonly state where practical. Domain objects should be dependency-free and should not import Zod, persistence adapters, backend SDKs, or UI frameworks.

## Commands

```bash
npm install
npm run build
npm run lint
npm test
npm run format:check
```

## Testing strategy

Use Vitest for focused unit tests. Tests should validate domain invariants, workflow results, and predictable failures. Keep infrastructure tests separate from domain behavior when future adapters are introduced.

## Formatting and linting

ESLint and Prettier are configured at the repository root. Use `npm run format` before larger documentation or code changes and `npm run lint` before submitting changes.

## Codespaces

The devcontainer installs Node LTS tooling and useful TypeScript, ESLint, Prettier, and Vitest VS Code extensions. Opening the repository in Codespaces should be enough to start development after `npm install` completes.
