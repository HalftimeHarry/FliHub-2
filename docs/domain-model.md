# Domain Model

## Shared Core

Core currently includes `Organization`, `Identifier`, `Money`, `DateRange`, and `DomainError`. Future shared candidates include users, people, roles, permissions, addresses, contact information, audit metadata, and common domain errors. Shared concepts should move into Core only after multiple domains need the same behavior.

## League proof of concept

The initial League model demonstrates:

`Organization -> League -> Season -> Tournament -> TournamentRegistration`

It also includes `Player` because tournament registration needs a participant. Future League concepts such as teams, memberships, registrations, eligibility, rankings, schedules, scores, results, officials, tournament staff, and prize structures should stay inside the League domain unless a cross-platform abstraction becomes necessary.

## Business proof of concept

The initial Business model demonstrates:

`Organization -> Department -> Project -> ReimbursementClaim`

`ExpenseItem` and `Money` support the reimbursement proof of concept. Future Business concepts include vendors, budgets, staff assignment, project membership, department membership, approval workflows, expenses, and reporting. Commercial concepts such as sponsors, advertisers, campaigns, sponsorship opportunities, contracts, media rights, media licenses, invoices, payments, and analytics belong in Business subdomains.

## Community boundary

Community will eventually support participant-facing services such as player profiles, memberships, community programs, facilities, reservations, events, digital goods, academy programming, and coaches. No Community behavior is implemented in Phase 0.
