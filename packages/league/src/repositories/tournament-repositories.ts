import { Identifier } from '@flihub/core';
import { InMemoryRepository } from '@flihub/persistence';
import type { Course } from '../course.js';
import type { Hole } from '../hole.js';
import type { League } from '../league.js';
import type { Player } from '../player.js';
import type { Season } from '../season.js';
import type { Team } from '../team.js';
import type { Tournament } from '../tournament.js';
import type { TournamentRegistration } from '../tournament-registration.js';
import type { TournamentTeeGroup } from '../tournament-tee-group.js';

export interface PlayerRepository {
  findById(id: Identifier): Promise<Player | undefined>;
  list(): Promise<readonly Player[]>;
}

export interface LeagueRepository {
  findById(id: Identifier): Promise<League | undefined>;
  save(league: League): Promise<void>;
  list(): Promise<readonly League[]>;
}

export interface SeasonRepository {
  findById(id: Identifier): Promise<Season | undefined>;
  save(season: Season): Promise<void>;
  deleteById(id: Identifier): Promise<void>;
  list(): Promise<readonly Season[]>;
}

export interface TournamentRepository {
  findById(id: Identifier): Promise<Tournament | undefined>;
  save(tournament: Tournament): Promise<void>;
  list(): Promise<readonly Tournament[]>;
}

export interface CourseRepository {
  findById(id: Identifier): Promise<Course | undefined>;
  save(course: Course): Promise<void>;
  list(): Promise<readonly Course[]>;
}

export interface HoleRepository {
  findById(id: Identifier): Promise<Hole | undefined>;
  save(hole: Hole): Promise<void>;
  listForCourse(courseId: Identifier): Promise<readonly Hole[]>;
  list(): Promise<readonly Hole[]>;
}

export interface TeamRepository {
  findById(id: Identifier): Promise<Team | undefined>;
  save(team: Team): Promise<void>;
  list(): Promise<readonly Team[]>;
}

export interface TournamentRegistrationRepository {
  existsForPlayer(
    tournamentId: Identifier,
    playerId: Identifier
  ): Promise<boolean>;
  save(registration: TournamentRegistration): Promise<void>;
  list(): Promise<readonly TournamentRegistration[]>;
}

export interface TournamentTeeGroupRepository {
  save(group: TournamentTeeGroup): Promise<void>;
  deleteForTournament(tournamentId: Identifier): Promise<void>;
  listForTournament(
    tournamentId: Identifier
  ): Promise<readonly TournamentTeeGroup[]>;
}

export class InMemoryPlayerRepository
  extends InMemoryRepository<Player>
  implements PlayerRepository {}

export class InMemoryLeagueRepository
  extends InMemoryRepository<League>
  implements LeagueRepository {}

export class InMemorySeasonRepository
  extends InMemoryRepository<Season>
  implements SeasonRepository {}

export class InMemoryTournamentRepository
  extends InMemoryRepository<Tournament>
  implements TournamentRepository {}

export class InMemoryCourseRepository
  extends InMemoryRepository<Course>
  implements CourseRepository {}

export class InMemoryHoleRepository
  extends InMemoryRepository<Hole>
  implements HoleRepository {
  public async listForCourse(courseId: Identifier): Promise<readonly Hole[]> {
    const holes = await this.list();
    return holes
      .filter((hole) => hole.courseId.equals(courseId))
      .sort((left, right) => left.number - right.number);
  }
}

export class InMemoryTeamRepository
  extends InMemoryRepository<Team>
  implements TeamRepository {}

export class InMemoryTournamentRegistrationRepository implements TournamentRegistrationRepository {
  private readonly registrations = new Map<string, TournamentRegistration>();

  public constructor(
    seedRegistrations: readonly TournamentRegistration[] = []
  ) {
    for (const registration of seedRegistrations) {
      this.registrations.set(registration.id.value, registration);
    }
  }

  public existsForPlayer(
    tournamentId: Identifier,
    playerId: Identifier
  ): Promise<boolean> {
    return Promise.resolve(
      [...this.registrations.values()].some(
        (registration) =>
          registration.tournamentId.equals(tournamentId) &&
          registration.playerId.equals(playerId)
      )
    );
  }

  public save(registration: TournamentRegistration): Promise<void> {
    this.registrations.set(registration.id.value, registration);
    return Promise.resolve();
  }

  public list(): Promise<readonly TournamentRegistration[]> {
    return Promise.resolve([...this.registrations.values()]);
  }
}

export class InMemoryTournamentTeeGroupRepository
  extends InMemoryRepository<TournamentTeeGroup>
  implements TournamentTeeGroupRepository {
  public async deleteForTournament(tournamentId: Identifier): Promise<void> {
    const groups = await this.listForTournament(tournamentId);
    await Promise.all(groups.map((group) => this.deleteById(group.id)));
  }

  public async listForTournament(
    tournamentId: Identifier
  ): Promise<readonly TournamentTeeGroup[]> {
    const groups = await this.list();
    return groups
      .filter((group) => group.tournamentId.equals(tournamentId))
      .sort((left, right) => left.number - right.number);
  }
}
