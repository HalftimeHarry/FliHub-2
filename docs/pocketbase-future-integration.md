# Future PocketBase Integration

PocketBase is a likely future backend, but this foundation deliberately avoids backend dependencies. Domain classes do not import PocketBase SDKs, persistence adapters, REST clients, SQL clients, or authentication providers.

## Intended approach

Repository interfaces define what the domain workflows need. Current in-memory adapters are only proof-of-concept implementations. Future adapters such as `PocketBaseTournamentRepository` or `PocketBaseReimbursementClaimRepository` should live in infrastructure-focused packages or modules and implement the same interfaces.

## Boundary rule

PocketBase should depend on FLIHub domain contracts; FLIHub domain objects should not depend on PocketBase. This keeps the business model portable if storage choices change.
