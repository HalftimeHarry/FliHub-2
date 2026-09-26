export const queryKeys = {
  org: {
    summary: (orgId: string) => ['org', 'summary', orgId],
    list: () => ['org', 'list'],
  },
  fantasy: {
    leagues: (orgId: string) => ['fantasy', 'leagues', orgId],
    league: (leagueId: string) => ['fantasy', 'league', leagueId],
    memberships: (leagueId: string) => ['fantasy', 'league', leagueId, 'memberships'],
    tournaments: (leagueId: string) => ['fantasy', 'league', leagueId, 'tournaments'],
    standings: (leagueId: string) => ['fantasy', 'league', leagueId, 'standings'],
    draft: (draftId: string) => ['fantasy', 'draft', draftId],
  },
} as const;
