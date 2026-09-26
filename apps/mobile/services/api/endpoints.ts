export const api = {
  org: {
    summary: '/organization',
    list: '/organization',
  },
  fantasy: {
    leagues: '/fantasy/leagues',
    league: (leagueId: string) => `/fantasy/leagues/${leagueId}`,
    requestJoin: (leagueId: string) => `/fantasy/leagues/${leagueId}/memberships/request`,
    approveMembership: (leagueId: string, membershipId: string) =>
      `/fantasy/leagues/${leagueId}/memberships/${membershipId}/approve`,
    tournaments: (leagueId: string) => `/fantasy/leagues/${leagueId}/tournaments`,
    seedLeague: '/fantasy/seed-league',
    draft: (draftId: string) => `/fantasy/drafts/${draftId}`,
    draftsPick: (draftId: string) => `/fantasy/drafts/${draftId}/pick`,
  },
} as const;
