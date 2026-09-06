import { DomainError, Identifier } from '@flihub/core';

export type PlayerType = 'student' | 'professional';

export class Player {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly displayName: string,
    public readonly active: boolean,
    public readonly playerType: PlayerType,
    public readonly schoolId: Identifier | undefined,
    public readonly professionalSince: Date | undefined
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    displayName: string;
    active?: boolean;
    playerType?: PlayerType;
    schoolId?: string;
    professionalSince?: Date;
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
      input.active ?? true,
      input.playerType ?? 'student',
      input.schoolId === undefined
        ? undefined
        : Identifier.create(input.schoolId, 'school id'),
      input.professionalSince === undefined
        ? undefined
        : new Date(input.professionalSince)
    );
  }

  public promoteToProfessional(promotedAt = new Date()): Player {
    if (this.playerType === 'professional') {
      return this;
    }

    return new Player(
      this.id,
      this.organizationId,
      this.displayName,
      this.active,
      'professional',
      this.schoolId,
      new Date(promotedAt)
    );
  }

  public canRegisterForTournament(): boolean {
    return this.active;
  }
}
