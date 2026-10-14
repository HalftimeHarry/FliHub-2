import { describe, expect, it } from 'vitest';
import {
  fetchDrafts,
  fetchFantasyLeagues,
  fetchFantasyTeams,
  fetchPlayers,
  fetchTeams,
  fetchTournaments,
  formatDateInputValueUtc,
  formatDateOnlyUtc,
  getUserCatalog,
  getOrganizationCatalog,
  registerCustomOrganization,
  resetDemoSeasonAndSponsorData,
  resolveTitleSponsorForTarget,
  seedTournamentGroupsAndAssignAllScorekeepers,
  type SponsorDto,
  type SponsorshipDealDto
} from './api.js';
import { sortProsForDisplay } from './player-table.js';

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

describe('pro roster sort helper', () => {
  it('sorts active professionals by team and then name for the modal table', () => {
    const rows = [
      { id: 'kat-mertsch', displayName: 'Kat Mertsch', teamName: 'Ace Makers', playerType: 'professional', active: true, status: 'active' },
      { id: 'simon-lizotte', displayName: 'Simon Lizotte', teamName: 'Ace Makers', playerType: 'professional', active: true, status: 'active' },
      { id: 'missy-gannon', displayName: 'Missy Gannon', teamName: 'Birdie Storm', playerType: 'professional', active: true, status: 'active' }
    ] as const;

    expect(sortProsForDisplay(rows, 'team')).toEqual([
      { id: 'kat-mertsch', displayName: 'Kat Mertsch', teamName: 'Ace Makers', playerType: 'professional', active: true, status: 'active' },
      { id: 'simon-lizotte', displayName: 'Simon Lizotte', teamName: 'Ace Makers', playerType: 'professional', active: true, status: 'active' },
      { id: 'missy-gannon', displayName: 'Missy Gannon', teamName: 'Birdie Storm', playerType: 'professional', active: true, status: 'active' }
    ]);
  });
});

describe('tournament setup workflow', () => {
  it('seeds groups before assigning all scorekeepers for a tournament', async () => {
    const calls: string[] = [];

    const groups = await seedTournamentGroupsAndAssignAllScorekeepers('tournament-1', {
      seedTournamentTeeGroups: async (tournamentId: string) => {
        calls.push(`seed:${tournamentId}`);
        return { tournamentId, created: 1 };
      },
      assignAllTournamentTeeGroupScorekeepers: async (tournamentId: string) => {
        calls.push(`assign:${tournamentId}`);
        return { assigned: 1 };
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

describe('sponsor logo metadata', () => {
  it('keeps a stable demo logoUrl for seeded sponsor records and restores them on reset', () => {
    const storage = createStorage();
    const reset = resetDemoSeasonAndSponsorData(storage);

    expect(reset.sponsors.filter((sponsor) => sponsor.logoUrl !== undefined)).toHaveLength(5);
    expect(reset.sponsors.find((sponsor) => sponsor.id === 'sponsor-young-america-capital')?.logoUrl).toBe('/brand/sponsors/summit-capital/full-logo.svg');
    expect(reset.sponsors.find((sponsor) => sponsor.id === 'sponsor-sccg-management')?.logoUrl).toBe('/brand/sponsors/harbor-financial/full-logo.svg');
    expect(reset.sponsors.find((sponsor) => sponsor.id === 'sponsor-neology')?.logoUrl).toBe('/brand/sponsors/greenline-logistics/full-logo.svg');
    expect(reset.sponsors.find((sponsor) => sponsor.id === 'sponsor-go-throw')?.logoUrl).toBe('/brand/sponsors/northstar-bank/full-logo.svg');
    expect(reset.sponsors.find((sponsor) => sponsor.id === 'sponsor-coghlan-technology-group')?.logoUrl).toBe('/brand/sponsors/coastal-energy/full-logo.svg');
  });
});

describe('season date-only formatting', () => {
  it('renders all canonical season boundary dates without local timezone drift', () => {
    expect(formatDateOnlyUtc('2027-05-31T00:00:00.000Z')).toBe('5/31/2027');
    expect(formatDateOnlyUtc('2027-08-31T23:59:59.999Z')).toBe('8/31/2027');
    expect(formatDateOnlyUtc('2027-09-12T00:00:00.000Z')).toBe('9/12/2027');
    expect(formatDateOnlyUtc('2027-12-13T23:59:59.999Z')).toBe('12/13/2027');

    expect(formatDateInputValueUtc('2027-05-31T00:00:00.000Z')).toBe('2027-05-31');
    expect(formatDateInputValueUtc('2027-08-31T23:59:59.999Z')).toBe('2027-08-31');
    expect(formatDateInputValueUtc('2027-09-12T00:00:00.000Z')).toBe('2027-09-12');
    expect(formatDateInputValueUtc('2027-12-13T23:59:59.999Z')).toBe('2027-12-13');

    const unchanged = '2027-09-12';
    expect(new Date(`${unchanged}T00:00:00.000Z`).toISOString()).toBe('2027-09-12T00:00:00.000Z');
  });
});

describe('title sponsor resolver', () => {
  const sponsors: readonly SponsorDto[] = [
    {
      id: 'sponsor-a',
      name: 'Apex Capital',
      brandName: 'Apex Capital',
      category: 'Capital',
      logoUrl: '/logos/apex.svg',
      status: 'active'
    },
    {
      id: 'sponsor-b',
      name: 'Blue Stone',
      brandName: 'Blue Stone',
      category: 'Technology',
      logoUrl: '/logos/bluestone.svg',
      status: 'active'
    },
    {
      id: 'sponsor-c',
      name: 'Crest Financial',
      brandName: 'Crest Financial',
      category: 'Finance',
      status: 'active'
    }
  ];

  it('accepts only explicit title-sponsor deals and separates confirmed from prospective results', () => {
    const deals: readonly SponsorshipDealDto[] = [
      {
        id: 'deal-1',
        sponsorId: 'sponsor-a',
        targetType: 'season',
        targetId: 'summer-2027',
        tierId: 'tier-title',
        status: 'active',
        contractValue: 1_000_000,
        isTitleSponsor: true
      },
      {
        id: 'deal-2',
        sponsorId: 'sponsor-b',
        targetType: 'season',
        targetId: 'summer-2027',
        tierId: 'tier-title',
        status: 'proposal',
        contractValue: 1_000_000,
        isTitleSponsor: true
      },
      {
        id: 'deal-3',
        sponsorId: 'sponsor-c',
        targetType: 'season',
        targetId: 'summer-2027',
        tierId: 'tier-major',
        status: 'active',
        contractValue: 500_000
      }
    ];

    const confirmed = resolveTitleSponsorForTarget({
      targetType: 'season',
      targetId: 'summer-2027',
      sponsors,
      deals
    });

    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.sponsor?.id).toBe('sponsor-a');
    expect(confirmed.deal?.id).toBe('deal-1');

    const prospective = resolveTitleSponsorForTarget({
      targetType: 'season',
      targetId: 'summer-2028',
      sponsors,
      deals: [
        {
          ...deals[1]!,
          targetId: 'summer-2028'
        }
      ]
    });

    expect(prospective.status).toBe('prospective');
    expect(prospective.sponsor?.id).toBe('sponsor-b');
    expect(prospective.label).toBe('Prospective title sponsor');
  });

  it('flags conflicts when multiple confirmed title deals exist for the same target', () => {
    const deals: readonly SponsorshipDealDto[] = [
      {
        id: 'deal-1',
        sponsorId: 'sponsor-a',
        targetType: 'tournament',
        targetId: 'tournament-7',
        tierId: 'tier-title',
        status: 'active',
        contractValue: 1_000_000,
        isTitleSponsor: true
      },
      {
        id: 'deal-2',
        sponsorId: 'sponsor-b',
        targetType: 'tournament',
        targetId: 'tournament-7',
        tierId: 'tier-title',
        status: 'paid',
        contractValue: 1_200_000,
        isTitleSponsor: true
      }
    ];

    const result = resolveTitleSponsorForTarget({
      targetType: 'tournament',
      targetId: 'tournament-7',
      sponsors,
      deals
    });

    expect(result.status).toBe('conflict');
    expect(result.deals).toHaveLength(2);
    expect(result.label).toBe('Title sponsor conflict');
  });

  it('returns not assigned when no explicit title deal exists', () => {
    const result = resolveTitleSponsorForTarget({
      targetType: 'season',
      targetId: 'winter-2028',
      sponsors,
      deals: [
        {
          id: 'deal-1',
          sponsorId: 'sponsor-a',
          targetType: 'season',
          targetId: 'winter-2028',
          tierId: 'tier-major',
          status: 'active',
          contractValue: 500_000
        }
      ]
    });

    expect(result.status).toBe('not-assigned');
    expect(result.sponsor).toBeUndefined();
    expect(result.label).toBe('Not assigned');
  });
});

describe('season and sponsor demo reset', () => {
  it('replaces stale seasons with the 2027 split and remains repeatable without duplicates', () => {
    const storage = createStorage();

    const firstReset = resetDemoSeasonAndSponsorData(storage);
    const secondReset = resetDemoSeasonAndSponsorData(storage);

    expect(firstReset.seasons.map((season) => season.name)).toEqual([
      'Summer Season',
      'Fall Season'
    ]);
    expect(firstReset.seasons).toEqual(secondReset.seasons);
    expect(firstReset.sponsors).toEqual(secondReset.sponsors);
    expect(firstReset.deals).toEqual(secondReset.deals);
    expect(firstReset.seasons.every((season) => season.id !== 'summer-season')).toBe(true);
    expect(firstReset.seasons.every((season) => season.id !== 'summer-2-season')).toBe(true);
    expect(firstReset.seasons).toEqual([
      expect.objectContaining({
        id: 'summer-2027',
        name: 'Summer Season',
        status: 'current',
        startsOn: '2027-05-31T00:00:00.000Z',
        endsOn: '2027-08-31T23:59:59.999Z'
      }),
      expect.objectContaining({
        id: 'fall-2027',
        name: 'Fall Season',
        status: 'upcoming',
        startsOn: '2027-09-12T00:00:00.000Z',
        endsOn: '2027-12-13T23:59:59.999Z'
      })
    ]);
    expect(firstReset.deals.every((deal) => deal.targetId === 'summer-2027' || deal.targetId === 'fall-2027')).toBe(true);
  });

  it('keeps unrelated league data unchanged while resetting only season and sponsor mock collections', async () => {
    const storage = createStorage();
    const originalWindow = (globalThis as { window?: { localStorage: Storage } }).window;
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: storage },
      configurable: true,
      writable: true
    });

    try {
      const before = {
        players: await fetchPlayers(),
        teams: await fetchTeams(),
        tournaments: await fetchTournaments(),
        fantasyLeagues: await fetchFantasyLeagues(),
        fantasyTeams: await fetchFantasyTeams(),
        drafts: await fetchDrafts()
      };

      const firstReset = resetDemoSeasonAndSponsorData(storage);

      expect(firstReset.seasons).toHaveLength(2);
      expect(firstReset.sponsors.some((sponsor) => sponsor.status === 'active')).toBe(true);
      expect(firstReset.deals.every((deal) => deal.targetId === 'summer-2027' || deal.targetId === 'fall-2027')).toBe(true);
      expect(await fetchPlayers()).toEqual(before.players);
      expect(await fetchTeams()).toEqual(before.teams);
      expect(await fetchTournaments()).toEqual(before.tournaments);
      expect(await fetchFantasyLeagues()).toEqual(before.fantasyLeagues);
      expect(await fetchFantasyTeams()).toEqual(before.fantasyTeams);
      expect(await fetchDrafts()).toEqual(before.drafts);
    } finally {
      if (originalWindow === undefined) {
        delete (globalThis as { window?: { localStorage: Storage } }).window;
      } else {
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          configurable: true,
          writable: true
        });
      }
    }
  });
});
