import { describe, expect, it } from 'vitest';
import { TournamentTeeGroup } from '@flihub/league';

describe('TournamentTeeGroup', () => {
  it('records an optional scorekeeper assignment', () => {
    const group = TournamentTeeGroup.create({
      id: 'tournament-1-group-1',
      tournamentId: 'tournament-1',
      number: 1,
      teeTime: '3:00 PM MST',
      teamIds: ['team-1', 'team-2'],
      scorekeeperId: 'staff-1'
    });

    expect(group.scorekeeperId?.value).toBe('staff-1');
    expect(group.teeTime).toBe('3:00 PM MST');
  });

  it('accepts timezone abbreviations from the venue configuration', () => {
    const group = TournamentTeeGroup.create({
      id: 'tournament-1-group-2',
      tournamentId: 'tournament-1',
      number: 2,
      teeTime: '3:10 PM MDT',
      teamIds: ['team-3', 'team-4']
    });

    expect(group.teeTime).toBe('3:10 PM MDT');
  });
});