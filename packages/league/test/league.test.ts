import { describe, expect, it } from 'vitest';
import { League, Season, Team } from '@flihub/league';

describe('League', () => {
  it('uses FLI Golf standard format by default without team payouts', () => {
    const league = League.create({
      id: 'league-1',
      organizationId: 'school-1',
      name: 'School Golf League'
    });

    expect(league.format).toBe('fli-golf-standard');
    expect(league.paysTeams).toBe(false);
  });

  it('supports school-specific formats and payout overrides', () => {
    const league = League.create({
      id: 'league-2',
      organizationId: 'school-1',
      name: 'Regional Golf League',
      format: 'round-robin',
      paysTeams: true
    });

    expect(league.format).toBe('round-robin');
    expect(league.paysTeams).toBe(true);
  });

  it('records brand metadata for seasons and teams', () => {
    const season = Season.create({
      id: 'season-1',
      leagueId: 'league-1',
      name: 'Summer Season',
      brand: 'FLI Golf League',
      startsOn: new Date('2026-05-01T00:00:00.000Z'),
      endsOn: new Date('2026-08-31T23:59:59.999Z')
    });

    const team = Team.create({
      id: 'team-ace-makers',
      organizationId: 'org-1',
      name: 'Ace Makers',
      brand: 'Ace Makers',
      malePlayerId: 'player-1',
      femalePlayerId: 'player-2'
    });

    expect(season.brand).toBe('FLI Golf League');
    expect(team.brand).toBe('Ace Makers');
  });
});
