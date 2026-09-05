import { Identifier } from '@flihub/core';

export class TournamentRegistration {
  private constructor(
    public readonly id: Identifier,
    public readonly tournamentId: Identifier,
    public readonly playerId: Identifier,
    public readonly registeredAt: Date
  ) {}

  public static create(input: {
    tournamentId: Identifier;
    playerId: Identifier;
    registeredAt: Date;
  }): TournamentRegistration {
    return new TournamentRegistration(
      Identifier.create(
        `${input.tournamentId.value}:${input.playerId.value}`,
        'tournament registration id'
      ),
      input.tournamentId,
      input.playerId,
      new Date(input.registeredAt)
    );
  }
}
