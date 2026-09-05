# Architecture

FLIHub is one platform with three major application domains: FLIHub League, FLIHub Business, and FLIHub Community. These domains share a small Core package but remain separated so each can become an independent application surface if future product direction requires it.

## Package boundaries

- `@flihub/core` contains concepts that are safe across the platform: `Organization`, `Identifier`, `Money`, date ranges, and common domain errors.
- `@flihub/workflows` contains the lightweight pipeline abstraction used by League and Business workflows.
- `@flihub/persistence` contains framework-independent repository contracts and in-memory adapters for proof-of-concept usage.
- `@flihub/league` contains professional sports operations concepts and the tournament registration proof of concept.
- `@flihub/business` contains internal operations concepts and the reimbursement claim proof of concept.
- `@flihub/community` is intentionally only a boundary placeholder in this phase.

Core must not become a dumping ground. A concept belongs in Core only when it is genuinely reusable and not tied to League, Business, or Community behavior.

## Architectural style

The domain model uses object-oriented design where it improves clarity: domain classes enforce constructor invariants, expose readonly state, and keep business behavior close to the object responsible for it. Zod validates external inputs at workflow boundaries but does not replace domain classes.

## Infrastructure isolation

Persistence is expressed through interfaces. In-memory repositories demonstrate behavior now; future adapters such as PocketBase repositories should implement the same contracts without changing domain classes.
