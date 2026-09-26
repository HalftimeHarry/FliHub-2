import { DomainError, Identifier } from '@flihub/core';

export type FantasyLeagueMembershipState =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'left'
  | 'banned';

export class FantasyLeagueMembership {
  private constructor(
    public readonly id: Identifier,
    public readonly leagueId: Identifier,
    public readonly userId: Identifier,
    public readonly role: 'owner' | 'participant',
    public readonly state: FantasyLeagueMembershipState,
    public readonly requestedAt: Date,
    public readonly reviewedAt: Date | undefined,
    public readonly reviewedByUserId: Identifier | undefined,
    public readonly note: string | undefined
  ) {}

  public static create(input: {
    id: string;
    leagueId: string;
    userId: string;
    role?: 'owner' | 'participant';
    state?: FantasyLeagueMembershipState;
    requestedAt: string | Date;
    reviewedAt?: string | Date;
    reviewedByUserId?: string;
    note?: string;
  }): FantasyLeagueMembership {
    const state = input.state ?? 'pending';
    const role = input.role ?? 'participant';

    if (!['owner', 'participant'].includes(role)) {
      throw new DomainError(
        'fantasy.membership.invalid_role',
        'Membership role must be owner or participant.'
      );
    }

    if (!['pending', 'approved', 'rejected', 'left', 'banned'].includes(state)) {
      throw new DomainError(
        'fantasy.membership.invalid_state',
        'Membership state is invalid.'
      );
    }

    return new FantasyLeagueMembership(
      Identifier.create(input.id, 'fantasy league membership id'),
      Identifier.create(input.leagueId, 'fantasy league id'),
      Identifier.create(input.userId, 'user id'),
      role,
      state,
      input.requestedAt instanceof Date ? input.requestedAt : new Date(input.requestedAt),
      input.reviewedAt === undefined
        ? undefined
        : input.reviewedAt instanceof Date
          ? input.reviewedAt
          : new Date(input.reviewedAt),
      input.reviewedByUserId === undefined
        ? undefined
        : Identifier.create(input.reviewedByUserId, 'reviewing user id'),
      input.note?.trim() || undefined
    );
  }

  public approve(actorId: string): FantasyLeagueMembership {
    return FantasyLeagueMembership.create({
      id: this.id.value,
      leagueId: this.leagueId.value,
      userId: this.userId.value,
      role: this.role,
      state: 'approved',
      requestedAt: this.requestedAt,
      reviewedAt: new Date(),
      reviewedByUserId: actorId,
      note: this.note
    });
  }

  public reject(actorId: string, note?: string): FantasyLeagueMembership {
    return FantasyLeagueMembership.create({
      id: this.id.value,
      leagueId: this.leagueId.value,
      userId: this.userId.value,
      role: this.role,
      state: 'rejected',
      requestedAt: this.requestedAt,
      reviewedAt: new Date(),
      reviewedByUserId: actorId,
      note
    });
  }
}
