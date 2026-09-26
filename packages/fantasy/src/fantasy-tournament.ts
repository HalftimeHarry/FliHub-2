import { DomainError, Identifier } from '@flihub/core';

export type FantasyTournamentStatus =
  | 'scheduled'
  | 'draft_pending'
  | 'draft_open'
  | 'draft_in_progress'
  | 'live'
  | 'complete'
  | 'cancelled';

export class FantasyTournament {
  private constructor(
    public readonly id: Identifier,
    public readonly leagueId: Identifier,
    public readonly seasonId: Identifier,
    public readonly tournamentNumber: number,
    public readonly name: string,
    public readonly status: FantasyTournamentStatus,
    public readonly participantIds: readonly Identifier[],
    public readonly draftRoomId: Identifier | undefined,
    public readonly scheduledAt: Date | undefined,
    public readonly startedAt: Date | undefined,
    public readonly completedAt: Date | undefined,
    public readonly realTournamentId: Identifier | undefined
  ) {}

  public static create(input: {
    id: string;
    leagueId: string;
    seasonId: string;
    tournamentNumber: number;
    name: string;
    status?: FantasyTournamentStatus;
    participantIds?: readonly string[];
    draftRoomId?: string;
    scheduledAt?: string | Date;
    startedAt?: string | Date;
    completedAt?: string | Date;
    realTournamentId?: string;
  }): FantasyTournament {
    const name = input.name.trim();
    if (name.length < 2) {
      throw new DomainError(
        'fantasy.tournament.invalid_name',
        'Fantasy tournament name must contain at least two characters.'
      );
    }

    const participantIds = (input.participantIds ?? []).map((id) =>
      Identifier.create(id, 'participant id')
    );

    if (!Number.isInteger(input.tournamentNumber) || input.tournamentNumber < 1) {
      throw new DomainError(
        'fantasy.tournament.invalid_number',
        'Fantasy tournament number must be a positive integer.'
      );
    }

    return new FantasyTournament(
      Identifier.create(input.id, 'fantasy tournament id'),
      Identifier.create(input.leagueId, 'fantasy league id'),
      Identifier.create(input.seasonId, 'season id'),
      input.tournamentNumber,
      name,
      input.status ?? 'scheduled',
      participantIds,
      input.draftRoomId === undefined
        ? undefined
        : Identifier.create(input.draftRoomId, 'draft room id'),
      input.scheduledAt === undefined
        ? undefined
        : input.scheduledAt instanceof Date
          ? input.scheduledAt
          : new Date(input.scheduledAt),
      input.startedAt === undefined
        ? undefined
        : input.startedAt instanceof Date
          ? input.startedAt
          : new Date(input.startedAt),
      input.completedAt === undefined
        ? undefined
        : input.completedAt instanceof Date
          ? input.completedAt
          : new Date(input.completedAt),
      input.realTournamentId === undefined
        ? undefined
        : Identifier.create(input.realTournamentId, 'real tournament id')
    );
  }
}
