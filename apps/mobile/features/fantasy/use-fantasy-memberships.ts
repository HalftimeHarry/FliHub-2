import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { fetchFantasyLeagueMemberships } from './fantasy-api';

export function useFantasyMemberships(leagueId?: string, session?: any) {
  return useQuery({
    queryKey: leagueId ? queryKeys.fantasy.memberships(leagueId) : ['fantasy', 'memberships'],
    queryFn: async () => {
      if (!leagueId) {
        return [];
      }
      return fetchFantasyLeagueMemberships(leagueId, session);
    },
    enabled: Boolean(leagueId),
  });
}
