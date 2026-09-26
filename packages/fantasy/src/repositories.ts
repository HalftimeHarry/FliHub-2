import type { Identifier } from '@flihub/core';
import { InMemoryRepository } from '@flihub/persistence';
import type { DraftRoom } from './draft/draft-room.js';
import type { FantasyLeague } from './fantasy-league.js';
import type { FantasyLeagueMembership } from './fantasy-league-membership.js';
import type { FantasyTeam } from './fantasy-team.js';
import type { FantasyTournament } from './fantasy-tournament.js';

export interface FantasyLeagueRepository {
  findById(id: Identifier): Promise<FantasyLeague | undefined>;
  save(league: FantasyLeague): Promise<void>;
  list(): Promise<readonly FantasyLeague[]>;
}

export interface FantasyLeagueMembershipRepository {
  findById(id: Identifier): Promise<FantasyLeagueMembership | undefined>;
  save(membership: FantasyLeagueMembership): Promise<void>;
  list(): Promise<readonly FantasyLeagueMembership[]>;
}

export interface FantasyTeamRepository {
  findById(id: Identifier): Promise<FantasyTeam | undefined>;
  save(team: FantasyTeam): Promise<void>;
  list(): Promise<readonly FantasyTeam[]>;
}

export interface FantasyTournamentRepository {
  findById(id: Identifier): Promise<FantasyTournament | undefined>;
  save(tournament: FantasyTournament): Promise<void>;
  list(): Promise<readonly FantasyTournament[]>;
}

export interface DraftRoomRepository {
  findById(id: Identifier): Promise<DraftRoom | undefined>;
  save(draft: DraftRoom): Promise<void>;
  list(): Promise<readonly DraftRoom[]>;
}

export class InMemoryFantasyLeagueRepository
  extends InMemoryRepository<FantasyLeague>
  implements FantasyLeagueRepository {}

export class InMemoryFantasyLeagueMembershipRepository
  extends InMemoryRepository<FantasyLeagueMembership>
  implements FantasyLeagueMembershipRepository {}

export class InMemoryFantasyTeamRepository
  extends InMemoryRepository<FantasyTeam>
  implements FantasyTeamRepository {}

export class InMemoryFantasyTournamentRepository
  extends InMemoryRepository<FantasyTournament>
  implements FantasyTournamentRepository {}

export class InMemoryDraftRoomRepository
  extends InMemoryRepository<DraftRoom>
  implements DraftRoomRepository {}
