import { DomainError, Identifier } from '@flihub/core';

export type TournamentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TournamentType = 'fli' | 'multi-round';

export class Tournament {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly seasonId: Identifier,
    public readonly name: string,
    public readonly type: TournamentType,
    public readonly scheduledOn: Date | undefined,
    public readonly status: TournamentStatus,
    public readonly courseId: Identifier | undefined
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    seasonId: string;
    name: string;
    type?: TournamentType;
    scheduledOn?: Date;
    status?: TournamentStatus;
    courseId?: string;
  }): Tournament {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'league.tournament.invalid_name',
        'Tournament name must contain at least two characters.'
      );
    }

    return new Tournament(
      Identifier.create(input.id, 'tournament id'),
      Identifier.create(input.organizationId, 'organization id'),
      Identifier.create(input.seasonId, 'season id'),
      name,
      input.type ?? 'fli',
      input.scheduledOn === undefined ? undefined : new Date(input.scheduledOn),
      input.status ?? 'scheduled',
      input.courseId === undefined
        ? undefined
        : Identifier.create(input.courseId, 'course id')
    );
  }

  public isRegistrationOpen(): boolean {
    return this.status === 'scheduled';
  }
}
