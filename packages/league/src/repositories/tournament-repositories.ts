import { Identifier } from '@flihub/core';
import { InMemoryRepository } from '@flihub/persistence';
import type { Player } from '../player.js';
import type { Tournament } from '../tournament.js';
import type { TournamentRegistration } from '../tournament-registration.js';

export interface PlayerRepository {
  findById(id: Identifier): Promise<Player | undefined>;
}

export interface TournamentRepository {
  findById(id: Identifier): Promise<Tournament | undefined>;
}

export interface TournamentRegistrationRepository {
  countForTournament(tournamentId: Identifier): Promise<number>;
  existsForPlayer(
    tournamentId: Identifier,
    playerId: Identifier
  ): Promise<boolean>;
  save(registration: TournamentRegistration): Promise<void>;
}

export class InMemoryPlayerRepository
  extends InMemoryRepository<Player>
  implements PlayerRepository {}

export class InMemoryTournamentRepository
  extends InMemoryRepository<Tournament>
  implements TournamentRepository {}

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
}
