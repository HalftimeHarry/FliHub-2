import { queryKeys } from '@/constants/query-keys';

export const fantasyQueries = {
  leagues: (orgId: string) => queryKeys.fantasy.leagues(orgId),
  league: (leagueId: string) => queryKeys.fantasy.league(leagueId),
  memberships: (leagueId: string) => queryKeys.fantasy.memberships(leagueId),
  tournaments: (leagueId: string) => queryKeys.fantasy.tournaments(leagueId),
  standings: (leagueId: string) => queryKeys.fantasy.standings(leagueId),
  draft: (draftId: string) => queryKeys.fantasy.draft(draftId),
};
