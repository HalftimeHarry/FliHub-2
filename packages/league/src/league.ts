import { DomainError, Identifier } from '@flihub/core';

export type LeagueFormat =
  | 'fli-golf-standard'
  | 'round-robin'
  | 'pool-play'
  | 'single-elimination'
  | 'custom';

export class League {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string,
    public readonly format: LeagueFormat,
    public readonly paysTeams: boolean
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
    format?: LeagueFormat;
    paysTeams?: boolean;
  }): League {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'league.invalid_name',
        'League name must contain at least two characters.'
      );
    }

    return new League(
      Identifier.create(input.id, 'league id'),
      Identifier.create(input.organizationId, 'organization id'),
      name,
      input.format ?? 'fli-golf-standard',
      input.paysTeams ?? false
    );
  }
}
