import { DomainError, Identifier } from '@flihub/core';

/**
 * The league owner can hand full commissioner powers to any participant
 * (ported from FLI-Golf/leagueDiagram DraftAdmins).
 */
export class DraftAdmins {
  private readonly delegates = new Set<string>();

  public constructor(public readonly ownerId: Identifier) {}

  public canAdminister(userId: Identifier): boolean {
    return userId.equals(this.ownerId) || this.delegates.has(userId.value);
  }

  public grantOwnerDuties(actorId: Identifier, participantId: Identifier): void {
    this.requireAdmin(actorId, 'grant owner duties');
    this.delegates.add(participantId.value);
  }

  public revokeOwnerDuties(actorId: Identifier, participantId: Identifier): void {
    this.requireAdmin(actorId, 'revoke owner duties');

    if (participantId.equals(this.ownerId)) {
      throw new DomainError(
        'fantasy.draft.owner_revoke_forbidden',
        'The league owner cannot have owner duties revoked.'
      );
    }

    this.delegates.delete(participantId.value);
  }

  public requireAdmin(actorId: Identifier, action: string): void {
    if (!this.canAdminister(actorId)) {
      throw new DomainError(
        'fantasy.draft.admin_required',
        `Only the league owner or an assigned co-owner can ${action}.`
      );
    }
  }

  public getDelegates(): readonly Identifier[] {
    return [...this.delegates].map((value) =>
      Identifier.create(value, 'delegate id')
    );
  }
}
