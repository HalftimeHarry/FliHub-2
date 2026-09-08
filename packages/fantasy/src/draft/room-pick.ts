import { Identifier } from '@flihub/core';

export class RoomPick {
  public constructor(
    public readonly participantId: Identifier,
    public readonly playerId: Identifier,
    public readonly round: number,
    public readonly pickNumber: number
  ) {}
}

export type DraftRoomStatus = 'pending' | 'in_progress' | 'complete';
