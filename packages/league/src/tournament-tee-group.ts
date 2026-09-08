import { DomainError, Identifier } from '@flihub/core';

export class TournamentTeeGroup {
  private constructor(
    public readonly id: Identifier,
    public readonly tournamentId: Identifier,
    public readonly number: number,
    public readonly teeTime: string,
    public readonly teamIds: readonly Identifier[],
    public readonly scorekeeperId: Identifier | undefined
  ) {}

  public static create(input: {
    id: string;
    tournamentId: string;
    number: number;
    teeTime: string;
    teamIds: readonly string[];
    scorekeeperId?: string;
  }): TournamentTeeGroup {
    if (!Number.isInteger(input.number) || input.number < 1) {
      throw new DomainError(
        'league.tournament_tee_group.invalid_number',
        'Tee group number must be a positive integer.'
      );
    }
    if (input.teamIds.length !== 2 || new Set(input.teamIds).size !== 2) {
      throw new DomainError(
        'league.tournament_tee_group.invalid_teams',
        'A tee group must contain exactly two different teams.'
      );
    }
    if (!/^\d{1,2}:\d{2} (AM|PM) PST$/.test(input.teeTime)) {
      throw new DomainError(
        'league.tournament_tee_group.invalid_tee_time',
        'Tee time must use the format h:mm AM/PM PST.'
      );
    }

    return new TournamentTeeGroup(
      Identifier.create(input.id, 'tournament tee group id'),
      Identifier.create(input.tournamentId, 'tournament id'),
      input.number,
      input.teeTime,
      input.teamIds.map((teamId) => Identifier.create(teamId, 'team id')),
      input.scorekeeperId === undefined
        ? undefined
        : Identifier.create(input.scorekeeperId, 'scorekeeper id')
    );
  }
}