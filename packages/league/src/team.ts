import { DomainError, Identifier } from '@flihub/core';

export const MAX_TEAMS_PER_LEAGUE = 12;

/**
 * A FLI Golf team: exactly two players — one male and one female
 * (ported from the FLI-Golf/leagueDiagram Team invariant).
 */
export class Team {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string,
    public readonly malePlayerId: Identifier,
    public readonly femalePlayerId: Identifier
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
    malePlayerId: string;
    femalePlayerId: string;
  }): Team {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'league.team.invalid_name',
        'Team name must contain at least two characters.'
      );
    }

    if (input.malePlayerId === input.femalePlayerId) {
      throw new DomainError(
        'league.team.duplicate_player',
        'A team must pair two different players.'
      );
    }

    return new Team(
      Identifier.create(input.id, 'team id'),
      Identifier.create(input.organizationId, 'organization id'),
      name,
      Identifier.create(input.malePlayerId, 'male player id'),
      Identifier.create(input.femalePlayerId, 'female player id')
    );
  }

  public get playerIds(): readonly Identifier[] {
    return [this.malePlayerId, this.femalePlayerId];
  }
}
