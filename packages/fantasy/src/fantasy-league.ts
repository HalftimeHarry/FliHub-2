import { DomainError, Identifier } from '@flihub/core';

export const MAX_FANTASY_PARTICIPANTS = 6;

export class FantasyLeague {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string,
    public readonly ownerUserId: Identifier,
    public readonly requiredApprovedParticipants: number,
    public readonly maxParticipants: number,
    public readonly participantIds: readonly Identifier[],
    public readonly seasonId: Identifier | undefined,
    public readonly activeTournamentId: Identifier | undefined,
    public readonly status: 'draft' | 'open' | 'active' | 'closed'
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
    ownerUserId: string;
    requiredApprovedParticipants?: number;
    maxParticipants?: number;
    participantIds?: readonly string[];
    seasonId?: string;
    activeTournamentId?: string;
    status?: 'draft' | 'open' | 'active' | 'closed';
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

    const maxParticipants = input.maxParticipants ?? MAX_FANTASY_PARTICIPANTS;
    const requiredApprovedParticipants =
      input.requiredApprovedParticipants ?? Math.min(5, maxParticipants);

    if (participantIds.length > maxParticipants) {
      throw new DomainError(
        'fantasy.league.too_many_participants',
        `A fantasy league cannot have more than ${maxParticipants.toString()} participants.`
      );
    }

    if (requiredApprovedParticipants > maxParticipants) {
      throw new DomainError(
        'fantasy.league.invalid_required_participants',
        'The required participant threshold cannot exceed the max participant count.'
      );
    }

    return new FantasyLeague(
      Identifier.create(input.id, 'fantasy league id'),
      Identifier.create(input.organizationId, 'organization id'),
      name,
      Identifier.create(input.ownerUserId, 'owner user id'),
      requiredApprovedParticipants,
      maxParticipants,
      participantIds,
      input.seasonId === undefined ? undefined : Identifier.create(input.seasonId, 'season id'),
      input.activeTournamentId === undefined
        ? undefined
        : Identifier.create(input.activeTournamentId, 'fantasy tournament id'),
      input.status ?? 'draft'
    );
  }

  public isFull(): boolean {
    return this.participantIds.length >= this.maxParticipants;
  }

  public isReadyForTournament(): boolean {
    return this.participantIds.length >= this.requiredApprovedParticipants;
  }
}
