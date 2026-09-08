import { describe, expect, it } from 'vitest';
import {
  getUserCatalog,
  getOrganizationCatalog,
  registerCustomOrganization,
  seedTournamentGroupsAndAssignAllScorekeepers
} from './api.js';

const createStorage = () => {
  let map = new Map<string, string>();

  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => {
      map = new Map();
    }
  } as Storage;
};

describe('organization catalog', () => {
  it('keeps seeded organizations and adds a registered custom organization', () => {
    const storage = createStorage();

    const customOrganization = registerCustomOrganization(
      {
        name: 'Hawks Valley Academy',
        enabledComponents: [
          'league-operations',
          'fli-golf-format',
          'teams-and-rosters',
          'courses-and-scoring'
        ]
      },
      storage
    );

    const catalog = getOrganizationCatalog(storage);

    expect(customOrganization.id).toBe('hawks-valley-academy');
    expect(catalog.some((organization) => organization.id === 'hawks-valley-academy')).toBe(true);
    expect(catalog.some((organization) => organization.name === 'FLI Golf')).toBe(true);
  });
});

describe('FLI Golf scorekeepers', () => {
  it('includes all six assigned scorekeepers in the user catalog', () => {
    const scorekeeperIds = getUserCatalog()
      .filter(
        (user) => user.organizationId === 'fgl' && user.canScorekeep === true
      )
      .map((user) => user.id);

    expect(scorekeeperIds).toEqual([
      'scorekeeper-1',
      'scorekeeper-2',
      'scorekeeper-3',
      'scorekeeper-4',
      'scorekeeper-5',
      'scorekeeper-6'
    ]);
  });
});

describe('tournament setup workflow', () => {
  it('seeds groups before assigning all scorekeepers for a tournament', async () => {
    const calls: string[] = [];

    const groups = await seedTournamentGroupsAndAssignAllScorekeepers('tournament-1', {
      seedTournamentTeeGroups: async (tournamentId: string) => {
        calls.push(`seed:${tournamentId}`);
      },
      assignAllTournamentTeeGroupScorekeepers: async (tournamentId: string) => {
        calls.push(`assign:${tournamentId}`);
      },
      fetchTournamentTeeGroups: async (tournamentId: string) => {
        calls.push(`fetch:${tournamentId}`);
        return [
          {
            id: 'group-1',
            number: 1,
            teeTime: '08:00',
            teamNames: ['Team A'],
            scorekeeperId: 'scorekeeper-1',
            scorekeeperName: 'A. Scorekeeper'
          }
        ] as any;
      }
    });

    expect(calls).toEqual([
      'seed:tournament-1',
      'assign:tournament-1',
      'fetch:tournament-1'
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe('group-1');
  });
});
