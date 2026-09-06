import { DomainError, Identifier } from '@flihub/core';

export type TournamentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export class Tournament {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly seasonId: Identifier,
    public readonly name: string,
    public readonly capacity: number,
    public readonly status: TournamentStatus
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    seasonId: string;
    name: string;
    capacity: number;
    status?: TournamentStatus;
  }): Tournament {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'league.tournament.invalid_name',
        'Tournament name must contain at least two characters.'
      );
    }

    if (!Number.isInteger(input.capacity) || input.capacity < 1) {
      throw new DomainError(
        'league.tournament.invalid_capacity',
        'Tournament capacity must be a positive integer.'
      );
    }

    return new Tournament(
      Identifier.create(input.id, 'tournament id'),
      Identifier.create(input.organizationId, 'organization id'),
      Identifier.create(input.seasonId, 'season id'),
      name,
      input.capacity,
      input.status ?? 'scheduled'
    );
  }

  public hasCapacity(currentRegistrationCount: number): boolean {
    return currentRegistrationCount < this.capacity;
  }

  public isRegistrationOpen(): boolean {
    return this.status === 'scheduled';
  }
}
