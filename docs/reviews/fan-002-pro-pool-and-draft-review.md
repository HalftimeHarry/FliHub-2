# FAN-002 — Pro Pool and Draft Review

**Repository:** FliHub-2 — Shared
**Review date:** 2026-10-16
**Reviewed branch:** Not recorded.
**Reviewed commit:** Reviewed commit not recorded.

The session evidence does not identify the exact revision that was reviewed.
The following is only the checkout metadata observed when this report was
saved; it is not asserted to be the reviewed revision:

- Branch: `feature/ticketing-system`
- HEAD: `aae4922cb1ebe3145ddfa4c8c1d9881d2c6fb0c4`

## Scope and verification

This review compared the supplied FAN-002 requirement with the FliHub-2
fantasy draft implementation. It inspected source code and the available test
coverage. It did not report running tests or verifying the live app. The
review was based on local source and mock/in-memory data, not a deployed or
production system.

## Requirement under review

> **FAN-002 — Pro pool and draft**
>
> Required behavior: Publish eligible Pros for fantasy selection, configure
> roster requirements and applicable position rules, and run the approved
> draft format.
>
> Acceptance criteria: An eligible Pro pool is published; approved roster and
> position rules apply; the approved draft format runs to completion in the
> pilot league.

## Summary

FliHub-2 contains a functional local fantasy draft prototype: an authorized
user can set up a pool and participant order, open a snake draft, and record
validated picks. It does not implement FAN-002 as written. In particular,
there is no published Pro pool, Pro-specific eligibility enforcement,
configurable roster or position rules, selected/approved draft format, or
end-to-end pilot-league completion verified by the available tests.

The existing gender-balance behavior is implemented, but it is fixed rather
than configurable and is not a position rule. It should not be treated as the
approved FAN-002 rule without a product decision.

## Names, roles, and objects in the current implementation

- **`Player`** is a League-domain object with a `playerType` of `student` or
  `professional`, an `active` flag, and optional `gender`. There is no
  `Talent` object or configurable Talent type in this model.
- **`FantasyLeagueMembership`** records a `userId`, role (`owner` or
  `participant`), and state (`pending`, `approved`, `rejected`, `left`, or
  `banned`).
- **`FantasyLeague`** records an owner user ID, participant IDs, approved
  participant threshold, maximum participant count, and league status. Its
  maximum participant count is six.
- **`DraftRoom`** holds the draft order, a pool of player IDs and gender
  values, picks, and the draft status. A pool entry has no player type,
  position, eligibility, or publication status.
- **`RoomPick`** records participant ID, player ID, round, and pick number.
- **`FantasyTeam`** separately holds an owner ID and player IDs, with a
  maximum roster size of six. Draft picks are not copied into this object on
  completion.
- **`DraftAdmins`** grants draft administration to the room owner and
  provides methods for delegating owner duties. No API route exposes those
  delegation methods.
- Global API user roles (`admin`, `leader`, `player`, and others) are separate
  from fantasy membership roles. The API uses mock users and an `x-user-id`
  header. Draft write routes require global `fantasy:write` permission;
  opening a draft also checks the `DraftRoom` owner. A pick request supplies a
  participant ID, but the handler does not establish that the caller is that
  participant or that the participant has approved membership.

There is an identity mismatch in the setup flow: the web UI selects draft
participants from the League player list, whereas fantasy membership refers
to users. Draft creation does not reconcile participant IDs with approved
memberships.

## Current workflow

1. The web dashboard lets an authorized user choose a fantasy league,
   participants/order, a player pool, and a pick-timer value.
2. The UI filters pool candidates to active players with gender set. The API
   checks that each selected player belongs to the caller's organization and
   has gender set, but does not enforce `active` or `playerType`.
3. `DraftRoom.create` requires a non-empty pool, pool size divisible by
   participant count, an even number of rounds, equal counts of male and
   female pool entries, and a positive timer value. It derives a fixed
   per-gender cap from the round count.
4. The room begins `pending`. The owner opens it, after which it is
   `in_progress`. Pick order alternates forward and backward each round
   (snake).
5. Picks are validated for current turn, membership in the configured pool,
   duplicate selection, and the fixed per-gender cap. The room becomes
   `complete` once all pool entries have been picked.
6. Picks remain on `DraftRoom`; no completed roster is saved to `FantasyTeam`.
   The UI displays “Draft complete — rosters are set,” but that message is not
   backed by an update to the separate fantasy team roster object.

The timer is stored and displayed/calculated, but expiration does not perform
an automatic pick or otherwise advance the draft. Pick submission also does
not pass a new start time to reset the clock for the next turn.

## Implementation status against FAN-002

### Implemented

- Local draft setup and board in the web dashboard.
- Draft participant order and player pool selection.
- Snake order, pending/in-progress/complete statuses, and pick recording.
- Server-side validation for turn order, player membership in the pool,
  repeated picks, and the current per-gender cap.
- In-memory repository interfaces and adapters supporting local API reads
  and writes during process lifetime.

### Mocked or demo-only

- Users, organization context, and sample League/Fantasy data are local
  mock/seed data. Fantasy repositories are in memory, not durable
  production storage.
- Seeded FGL League players are mostly professional, but this is a property
  of sample records, not a Pro eligibility rule.
- The `/fantasy/seed-league` route creates demo league/tournament/membership
  records and a generated draft. It does not publish an eligible Pro pool.

### Incomplete

- The UI filters on active status and gender, but not on professional
  `playerType`; the API itself does not enforce either professional type or
  active status for a selected pool entry.
- The timer has no timeout-driven pick/advance behavior and is not reset by
  each pick.
- `FantasyTeam` has a six-player maximum, but that limit is not a configurable
  draft roster requirement and draft picks do not populate fantasy teams.
- Draft locking exists in the domain object, but no inspected API or workflow
  connects it to tournament start.
- The existing draft flow does not enforce approved fantasy membership for
  the selected participant IDs or ensure a pick is made by that participant.

### Missing from the inspected implementation

- A `Talent` object with Pros, Broadcasters, Extras, or configurable types.
- A published Pro pool or pool publication state.
- Pro-specific eligibility enforcement for pool creation and selection.
- Configurable roster size/requirements and configurable position rules.
- Position data on pool players or position-specific validation.
- A user-selectable or explicitly configured approved draft format; the
  current draft format is snake.
- A persisted transition from completed picks to fantasy team rosters.
- An end-to-end pilot-league completion test covering the published eligible
  pool, approved rules, approved format, and resulting rosters.

## Test coverage and limitations

The fantasy package's `fantasy-league-flow.test.ts` creates an owner-led
league, approved membership, tournament, and pending draft. It does not drive
the draft through picks to completion or verify resulting saved rosters. The
review inspected that test and available related test coverage; it did not
report running tests or verifying the live app.

## Relevant documentation and code paths

- [README.md](../../README.md) describes the app as a local prototype with
  mock API data and fantasy draft interaction.
- [architecture.md](../architecture.md) calls the Fantasy package a boundary
  placeholder, which does not reflect all of the draft code now present.
- [apps/mobile/README.md](../../apps/mobile/README.md) lists a fantasy
  lifecycle, but the mobile draft view is a static placeholder:
  [draft.tsx](../../apps/mobile/app/(tabs)/draft.tsx).
- [draft-room.ts](../../packages/fantasy/src/draft/draft-room.ts) implements
  current draft setup constraints, ordering, timer state, and pick behavior.
- [fantasy-league.ts](../../packages/fantasy/src/fantasy-league.ts),
  [fantasy-league-membership.ts](../../packages/fantasy/src/fantasy-league-membership.ts),
  and [fantasy-team.ts](../../packages/fantasy/src/fantasy-team.ts) define
  league membership, league limits, and the separate roster/team object.
- [player.ts](../../packages/league/src/player.ts) defines the existing
  `student`/`professional` distinction.
- [index.ts](../../apps/api/src/index.ts) contains fantasy API routes and
  draft serialization.
- [dashboard.tsx](../../apps/web/src/components/dashboard.tsx) contains
  draft setup and the web draft board.
- [api.ts](../../apps/web/src/lib/api.ts) contains the client-side fantasy
  and draft DTOs.
- [fantasy-league-flow.test.ts](../../packages/fantasy/test/fantasy-league-flow.test.ts)
  is the existing fantasy flow test.
- [seed-data.ts](../../apps/api/src/seed-data.ts) contains local League and
  Fantasy seed data.

## Suggested FAN-002 wording — proposal, not approval

The following is a proposal for requirement wording. It describes intended
behavior and must not be interpreted as a statement of current FliHub-2
behavior or as an approved product decision.

### FAN-002 — Publish the Pro pool and complete the pilot draft

As a League owner, I can publish the eligible Pros available for fantasy
selection, configure the pilot league's roster requirements and applicable
position rules, and run the approved draft format to completion.
Fantasy owners/participants can make valid selections and receive their
resulting fantasy rosters.

#### Proposed acceptance criteria

- A League owner can publish a Pro pool for the pilot league. Only eligible
  Talent whose type is Pro is selectable; the eligibility rule and published
  pool are visible to draft participants.
- A League owner can configure roster size and any applicable position
  requirements. The system validates configuration and prevents selections
  that violate those rules.
- The pilot league runs the explicitly approved draft format. Selection
  order, turn validation, and any timeout behavior follow that format's
  agreed rules.
- Fantasy owners/participants can make selections only when permitted by the
  draft rules. A Pro cannot be selected more times than the configured rules
  allow.
- Draft completion requires all configured roster requirements to be
  satisfied. The resulting rosters are saved and remain available after the
  draft is reloaded.
- The pilot league completes an end-to-end draft using the published Pro
  pool and approved roster, position, and draft-format rules.

Before this proposal is finalized, FAN-002 should identify the approved
draft format and define “eligible Pro,” including whether eligibility depends
on active status or other criteria. The current snake format and fixed
gender-balance constraints are observations about existing code, not
recommendations or adopted requirements.
