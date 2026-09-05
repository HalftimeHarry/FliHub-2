import { DomainError, Identifier } from '@flihub/core';

export class Tournament {
  private constructor(
    public readonly id: Identifier,
    public readonly seasonId: Identifier,
    public readonly name: string,
    public readonly capacity: number
  ) {}

  public static create(input: {
    id: string;
    seasonId: string;
    name: string;
    capacity: number;
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
      Identifier.create(input.seasonId, 'season id'),
      name,
      input.capacity
    );
  }

  public hasCapacity(currentRegistrationCount: number): boolean {
    return currentRegistrationCount < this.capacity;
  }
}
