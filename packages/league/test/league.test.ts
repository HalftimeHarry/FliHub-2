import { describe, expect, it } from 'vitest';
import { League } from '@flihub/league';

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
});
