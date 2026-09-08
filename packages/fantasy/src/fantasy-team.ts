import { DomainError, Identifier } from '@flihub/core';

export const MAX_FANTASY_ROSTER_SIZE = 6;

export class FantasyTeam {
  private constructor(
    public readonly id: Identifier,
    public readonly fantasyLeagueId: Identifier,
    public readonly ownerId: Identifier,
    public readonly name: string,
    public readonly playerIds: readonly Identifier[]
  ) {}

  public static create(input: {
    id: string;
    fantasyLeagueId: string;
    ownerId: string;
    name: string;
    playerIds?: readonly string[];
  }): FantasyTeam {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'fantasy.team.invalid_name',
        'Fantasy team name must contain at least two characters.'
      );
    }

    const playerIds = (input.playerIds ?? []).map((id) =>
      Identifier.create(id, 'player id')
    );

    if (playerIds.length > MAX_FANTASY_ROSTER_SIZE) {
      throw new DomainError(
        'fantasy.team.roster_too_large',
        `A fantasy team cannot have more than ${MAX_FANTASY_ROSTER_SIZE.toString()} players.`
      );
    }

    return new FantasyTeam(
      Identifier.create(input.id, 'fantasy team id'),
      Identifier.create(input.fantasyLeagueId, 'fantasy league id'),
      Identifier.create(input.ownerId, 'owner id'),
      name,
      playerIds
    );
  }
}
