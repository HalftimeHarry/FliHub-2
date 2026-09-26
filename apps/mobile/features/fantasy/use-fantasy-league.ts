import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { fetchFantasyLeagues } from './fantasy-api';

export function useFantasyLeague(leagueId?: string, session?: any) {
  return useQuery({
    queryKey: leagueId ? queryKeys.fantasy.league(leagueId) : ['fantasy', 'league'],
    queryFn: async () => {
      const allLeagues = await fetchFantasyLeagues(undefined, session);
      return allLeagues.find((league) => league.id === leagueId) ?? null;
    },
    enabled: Boolean(leagueId),
  });
}
