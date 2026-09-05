import { describe, expect, it } from 'vitest';
import {
  createTournamentRegistrationWorkflow,
  InMemoryPlayerRepository,
  InMemoryTournamentRegistrationRepository,
  InMemoryTournamentRepository,
  Player,
  Tournament
} from '@flihub/league';

describe('createTournamentRegistrationWorkflow', () => {
  it('registers an active player when capacity is available', async () => {
    const workflow = createTournamentRegistrationWorkflow({
      players: new InMemoryPlayerRepository([
        Player.create({ id: 'player-1', displayName: 'Alex Player' })
      ]),
      tournaments: new InMemoryTournamentRepository([
        Tournament.create({
          id: 'tournament-1',
          seasonId: 'season-1',
          name: 'Opening Cup',
          capacity: 2
        })
      ]),
      registrations: new InMemoryTournamentRegistrationRepository()
    });

    const result = await workflow.execute({
      playerId: 'player-1',
      tournamentId: 'tournament-1',
      requestedAt: '2026-01-10T12:00:00.000Z'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toMatchObject({
        registrationId: 'tournament-1:player-1',
        tournamentId: 'tournament-1',
        playerId: 'player-1',
        registeredAt: '2026-01-10T12:00:00.000Z'
      });
    }
  });

  it('returns a domain failure for inactive players', async () => {
    const workflow = createTournamentRegistrationWorkflow({
      players: new InMemoryPlayerRepository([
        Player.create({
          id: 'player-1',
          displayName: 'Alex Player',
          active: false
        })
      ]),
      tournaments: new InMemoryTournamentRepository([
        Tournament.create({
          id: 'tournament-1',
          seasonId: 'season-1',
          name: 'Opening Cup',
          capacity: 2
        })
      ]),
      registrations: new InMemoryTournamentRegistrationRepository()
    });

    const result = await workflow.execute({
      playerId: 'player-1',
      tournamentId: 'tournament-1'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('league.registration.player_inactive');
    }
  });
});
