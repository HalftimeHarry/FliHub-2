import { DomainError, Identifier } from '@flihub/core';
import { DraftAdmins } from './draft-admins.js';
import { RoomPick, type DraftRoomStatus } from './room-pick.js';

export interface DraftPoolPlayer {
  readonly id: Identifier;
  readonly gender: 'male' | 'female';
}

/**
 * A live fantasy draft: snake order, per-roster gender balance, pick timer,
 * and owner/co-owner administration (ported from FLI-Golf/leagueDiagram
 * DraftRoom). Behavior-rich and stateful by design — it models a live room.
 */
export class DraftRoom {
  private readonly picks: RoomPick[] = [];
  private readonly admins: DraftAdmins;
  private readonly timerSeconds: number;
  private clockStartedAt: number | undefined = undefined;
  private locked = false;

  private constructor(
    public readonly id: Identifier,
    public readonly fantasyLeagueId: Identifier,
    public readonly organizationId: Identifier,
    public readonly order: readonly Identifier[],
    public readonly pool: readonly DraftPoolPlayer[],
    ownerId: Identifier,
    timerSeconds: number
  ) {
    this.admins = new DraftAdmins(ownerId);
    this.timerSeconds = timerSeconds;
  }

  public static create(input: {
    id: string;
    fantasyLeagueId: string;
    organizationId: string;
    order: readonly string[];
    pool: readonly { id: string; gender: 'male' | 'female' }[];
    ownerId: string;
    timerSeconds?: number;
  }): DraftRoom {
    const order = input.order.map((id) => Identifier.create(id, 'participant id'));
    const pool = input.pool.map((player) => ({
      id: Identifier.create(player.id, 'player id'),
      gender: player.gender
    }));

    if (order.length === 0) {
      throw new DomainError(
        'fantasy.draft.no_participants',
        'A draft room needs at least one participant.'
      );
    }

    if (new Set(input.order).size !== input.order.length) {
      throw new DomainError(
        'fantasy.draft.duplicate_participant',
        'A participant cannot appear twice in the draft order.'
      );
    }

    if (pool.length === 0 || pool.length % order.length !== 0) {
      throw new DomainError(
        'fantasy.draft.pool_not_divisible',
        'The player pool must divide evenly across the participants.'
      );
    }

    const rounds = pool.length / order.length;
    if (rounds % 2 !== 0) {
      throw new DomainError(
        'fantasy.draft.odd_rounds',
        'The draft needs an even number of rounds so rosters can be gender balanced.'
      );
    }

    const males = pool.filter((player) => player.gender === 'male').length;
    if (males * 2 !== pool.length) {
      throw new DomainError(
        'fantasy.draft.gender_imbalanced_pool',
        'The player pool must hold an equal number of male and female players.'
      );
    }

    const timerSeconds = input.timerSeconds ?? 60;
    if (!Number.isFinite(timerSeconds) || timerSeconds <= 0) {
      throw new DomainError(
        'fantasy.draft.invalid_timer',
        'The pick timer must be a positive number of seconds.'
      );
    }

    return new DraftRoom(
      Identifier.create(input.id, 'draft id'),
      Identifier.create(input.fantasyLeagueId, 'fantasy league id'),
      Identifier.create(input.organizationId, 'organization id'),
      order,
      pool,
      Identifier.create(input.ownerId, 'owner id'),
      timerSeconds
    );
  }

  public get rounds(): number {
    return this.pool.length / this.order.length;
  }

  public get maxPerGender(): number {
    return this.rounds / 2;
  }

  public getStatus(): DraftRoomStatus {
    if (this.picks.length === this.pool.length) {
      return 'complete';
    }

    return this.clockStartedAt === undefined ? 'pending' : 'in_progress';
  }

  public open(actorId: Identifier, now: number = Date.now()): void {
    this.admins.requireAdmin(actorId, 'open the draft');
    this.clockStartedAt = now;
  }

  public getTimerSeconds(): number {
    return this.timerSeconds;
  }

  public getSecondsRemaining(now: number = Date.now()): number {
    if (this.clockStartedAt === undefined || this.getStatus() === 'complete') {
      return this.timerSeconds;
    }

    const elapsed = Math.floor((now - this.clockStartedAt) / 1000);
    return Math.max(0, this.timerSeconds - elapsed);
  }

  public isOnTheClockExpired(now: number = Date.now()): boolean {
    return this.getStatus() === 'in_progress' && this.getSecondsRemaining(now) === 0;
  }

  public getCurrentRound(): number {
    return Math.min(this.rounds, Math.floor(this.picks.length / this.order.length) + 1);
  }

  // Snake: odd rounds run down the order, even rounds run back up it.
  public getParticipantForPick(pickNumber: number): Identifier | undefined {
    if (pickNumber < 1 || pickNumber > this.pool.length) {
      return undefined;
    }

    const index = pickNumber - 1;
    const round = Math.floor(index / this.order.length) + 1;
    const indexInRound = index % this.order.length;
    return round % 2 === 1
      ? this.order[indexInRound]
      : this.order[this.order.length - 1 - indexInRound];
  }

  public getParticipantOnTheClock(): Identifier | undefined {
    return this.getParticipantForPick(this.picks.length + 1);
  }

  public getNextParticipant(): Identifier | undefined {
    return this.getParticipantForPick(this.picks.length + 2);
  }

  public getRoster(participantId: Identifier): readonly Identifier[] {
    return this.picks
      .filter((pick) => pick.participantId.equals(participantId))
      .map((pick) => pick.playerId);
  }

  public getGenderCount(participantId: Identifier, gender: 'male' | 'female'): number {
    const roster = new Set(
      this.getRoster(participantId).map((playerId) => playerId.value)
    );
    return this.pool.filter(
      (player) => roster.has(player.id.value) && player.gender === gender
    ).length;
  }

  public getAvailablePlayers(): readonly DraftPoolPlayer[] {
    const taken = new Set(this.picks.map((pick) => pick.playerId.value));
    return this.pool.filter((player) => !taken.has(player.id.value));
  }

  public getSelectablePlayers(participantId: Identifier): readonly DraftPoolPlayer[] {
    return this.getAvailablePlayers().filter(
      (player) => this.getGenderCount(participantId, player.gender) < this.maxPerGender
    );
  }

  public isAdmin(actorId: Identifier): boolean {
    return this.admins.canAdminister(actorId);
  }

  // Once the tournament is under way the roster is final.
  public lock(): void {
    this.locked = true;
  }

  public isLocked(): boolean {
    return this.locked;
  }

  public pick(input: {
    participantId: string;
    playerId: string;
    now?: number;
  }): RoomPick {
    if (this.locked) {
      throw new DomainError(
        'fantasy.draft.locked',
        'Picks are closed because the tournament has started.'
      );
    }

    if (this.getStatus() === 'complete') {
      throw new DomainError(
        'fantasy.draft.complete',
        'The draft is already complete.'
      );
    }

    const participantId = Identifier.create(input.participantId, 'participant id');
    const playerId = Identifier.create(input.playerId, 'player id');

    const onTheClock = this.getParticipantOnTheClock();
    if (!onTheClock?.equals(participantId)) {
      throw new DomainError(
        'fantasy.draft.out_of_turn',
        `It is not ${input.participantId}'s turn to pick.`
      );
    }

    const player = this.pool.find((entry) => entry.id.equals(playerId));
    if (player === undefined) {
      throw new DomainError(
        'fantasy.draft.player_not_in_pool',
        'That player is not in this draft pool.'
      );
    }

    if (this.picks.some((pick) => pick.playerId.equals(playerId))) {
      throw new DomainError(
        'fantasy.draft.player_taken',
        'That player has already been drafted.'
      );
    }

    if (this.getGenderCount(participantId, player.gender) >= this.maxPerGender) {
      throw new DomainError(
        'fantasy.draft.gender_cap',
        `${input.participantId} already holds ${this.maxPerGender.toString()} ${player.gender} players and must pick another gender.`
      );
    }

    const pick = new RoomPick(
      participantId,
      playerId,
      this.getCurrentRound(),
      this.picks.length + 1
    );
    this.picks.push(pick);

    if (input.now !== undefined) {
      this.clockStartedAt = input.now;
    }

    return pick;
  }

  public getPicks(): readonly RoomPick[] {
    return [...this.picks];
  }
}
