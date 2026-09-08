import type { Identifier } from '@flihub/core';
import { InMemoryRepository } from '@flihub/persistence';
import type { DraftRoom } from './draft/draft-room.js';
import type { FantasyLeague } from './fantasy-league.js';
import type { FantasyTeam } from './fantasy-team.js';

export interface FantasyLeagueRepository {
  findById(id: Identifier): Promise<FantasyLeague | undefined>;
  save(league: FantasyLeague): Promise<void>;
  list(): Promise<readonly FantasyLeague[]>;
}

export interface FantasyTeamRepository {
  findById(id: Identifier): Promise<FantasyTeam | undefined>;
  save(team: FantasyTeam): Promise<void>;
  list(): Promise<readonly FantasyTeam[]>;
}

export interface DraftRoomRepository {
  findById(id: Identifier): Promise<DraftRoom | undefined>;
  save(draft: DraftRoom): Promise<void>;
  list(): Promise<readonly DraftRoom[]>;
}

export class InMemoryFantasyLeagueRepository
  extends InMemoryRepository<FantasyLeague>
  implements FantasyLeagueRepository {}

export class InMemoryFantasyTeamRepository
  extends InMemoryRepository<FantasyTeam>
  implements FantasyTeamRepository {}

export class InMemoryDraftRoomRepository
  extends InMemoryRepository<DraftRoom>
  implements DraftRoomRepository {}
