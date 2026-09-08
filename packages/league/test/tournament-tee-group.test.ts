import { describe, expect, it } from 'vitest';
import { TournamentTeeGroup } from '@flihub/league';

describe('TournamentTeeGroup', () => {
  it('records an optional scorekeeper assignment', () => {
    const group = TournamentTeeGroup.create({
      id: 'tournament-1-group-1',
      tournamentId: 'tournament-1',
      number: 1,
      teeTime: '3:00 PM PST',
      teamIds: ['team-1', 'team-2'],
      scorekeeperId: 'staff-1'
    });

    expect(group.scorekeeperId?.value).toBe('staff-1');
  });
});