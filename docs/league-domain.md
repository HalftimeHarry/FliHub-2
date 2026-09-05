# FLIHub League Domain

FLIHub League manages professional sports operations.

## Initial boundary

The current proof of concept models `Organization -> League -> Season -> Tournament -> Competition` as the architectural direction and implements enough code for `Organization`, `League`, `Season`, `Tournament`, `Player`, and `TournamentRegistration`.

## Future concepts

Players, teams, memberships, registrations, eligibility, rankings, schedules, scores, results, officials, tournament staff, and prize structures belong in the League domain. They should not be placed in Core unless they become genuinely reusable platform concepts.

## Registration proof of concept

The tournament registration workflow demonstrates boundary validation, repository interfaces, player resolution, activity checks, tournament capacity checks, registration creation, and predictable domain failures.
