import { DomainError, Identifier } from '@flihub/core';

export class Player {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly displayName: string,
    public readonly active: boolean
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    displayName: string;
    active?: boolean;
  }): Player {
    const displayName = input.displayName.trim();

    if (displayName.length < 2) {
      throw new DomainError(
        'league.player.invalid_display_name',
        'Player display name must contain at least two characters.'
      );
    }

    return new Player(
      Identifier.create(input.id, 'player id'),
      Identifier.create(input.organizationId, 'organization id'),
      displayName,
      input.active ?? true
    );
  }

  public canRegisterForTournament(): boolean {
    return this.active;
  }
}
