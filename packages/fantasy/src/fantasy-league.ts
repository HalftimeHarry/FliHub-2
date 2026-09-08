import { DomainError, Identifier } from '@flihub/core';

export const MAX_FANTASY_PARTICIPANTS = 6;

export class FantasyLeague {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string,
    public readonly participantIds: readonly Identifier[]
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
    participantIds?: readonly string[];
  }): FantasyLeague {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'fantasy.league.invalid_name',
        'Fantasy league name must contain at least two characters.'
      );
    }

    const participantIds = (input.participantIds ?? []).map((id) =>
      Identifier.create(id, 'participant id')
    );

    if (participantIds.length > MAX_FANTASY_PARTICIPANTS) {
      throw new DomainError(
        'fantasy.league.too_many_participants',
        `A fantasy league cannot have more than ${MAX_FANTASY_PARTICIPANTS.toString()} participants.`
      );
    }

    return new FantasyLeague(
      Identifier.create(input.id, 'fantasy league id'),
      Identifier.create(input.organizationId, 'organization id'),
      name,
      participantIds
    );
  }

  public isFull(): boolean {
    return this.participantIds.length >= MAX_FANTASY_PARTICIPANTS;
  }
}
