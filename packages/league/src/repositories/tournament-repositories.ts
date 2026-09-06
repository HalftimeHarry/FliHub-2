import { Identifier } from '@flihub/core';
import { InMemoryRepository } from '@flihub/persistence';
import type { Course } from '../course.js';
import type { Hole } from '../hole.js';
import type { Player } from '../player.js';
import type { Team } from '../team.js';
import type { Tournament } from '../tournament.js';
import type { TournamentRegistration } from '../tournament-registration.js';

export interface PlayerRepository {
  findById(id: Identifier): Promise<Player | undefined>;
  list(): Promise<readonly Player[]>;
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
  countForTournament(tournamentId: Identifier): Promise<number>;
  existsForPlayer(
    tournamentId: Identifier,
    playerId: Identifier
  ): Promise<boolean>;
  save(registration: TournamentRegistration): Promise<void>;
  list(): Promise<readonly TournamentRegistration[]>;
}

export class InMemoryPlayerRepository
  extends InMemoryRepository<Player>
  implements PlayerRepository {}

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

  public countForTournament(tournamentId: Identifier): Promise<number> {
    return Promise.resolve(
      [...this.registrations.values()].filter((registration) =>
        registration.tournamentId.equals(tournamentId)
      ).length
    );
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
