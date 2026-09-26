import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { fetchFantasyStandings } from './fantasy-api';

export function useFantasyStandings(leagueId?: string, session?: any) {
  return useQuery({
    queryKey: leagueId ? queryKeys.fantasy.standings(leagueId) : ['fantasy', 'standings'],
    queryFn: () => (leagueId ? fetchFantasyStandings(leagueId, session) : Promise.resolve([])),
    enabled: Boolean(leagueId),
  });
}
