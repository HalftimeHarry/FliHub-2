import { describe, expect, it } from 'vitest';
import {
  DraftRoom,
  FantasyLeague,
  FantasyLeagueMembership,
  FantasyTournament,
  MAX_FANTASY_PARTICIPANTS
} from '../src/index.js';

describe('fantasy league flow', () => {
  it('creates an owner-led league with approved members and a tournament draft', () => {
    const league = FantasyLeague.create({
      id: 'league-1',
      organizationId: 'org-1',
      name: 'Weekend Fantasy League',
      ownerUserId: 'owner-1',
      requiredApprovedParticipants: 5,
      maxParticipants: MAX_FANTASY_PARTICIPANTS,
      participantIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5']
    });

    const membership = FantasyLeagueMembership.create({
      id: 'membership-1',
      leagueId: 'league-1',
      userId: 'user-2',
      role: 'participant',
      state: 'approved',
      requestedAt: '2026-09-01T00:00:00.000Z'
    });

    const tournament = FantasyTournament.create({
      id: 'tournament-1',
      leagueId: 'league-1',
      seasonId: 'season-1',
      tournamentNumber: 1,
      name: 'Fantasy Round 1',
      status: 'draft_pending',
      participantIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5']
    });

    const draft = DraftRoom.create({
      id: 'draft-1',
      fantasyLeagueId: 'league-1',
      fantasyTournamentId: 'tournament-1',
      organizationId: 'org-1',
      order: tournament.participantIds.map((participantId) => participantId.value),
      pool: [
        { id: 'player-1', gender: 'male' },
        { id: 'player-2', gender: 'female' },
        { id: 'player-3', gender: 'male' },
        { id: 'player-4', gender: 'female' },
        { id: 'player-5', gender: 'male' },
        { id: 'player-6', gender: 'female' },
        { id: 'player-7', gender: 'male' },
        { id: 'player-8', gender: 'female' },
        { id: 'player-9', gender: 'male' },
        { id: 'player-10', gender: 'female' }
      ],
      ownerId: 'owner-1',
      timerSeconds: 60
    });

    expect(league.ownerUserId.value).toBe('owner-1');
    expect(league.requiredApprovedParticipants).toBe(5);
    expect(membership.state).toBe('approved');
    expect(tournament.participantIds).toHaveLength(5);
    expect(draft.order).toHaveLength(5);
    expect(draft.getStatus()).toBe('pending');
  });
});
