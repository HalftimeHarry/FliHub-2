import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { fetchFantasyLeagues } from './fantasy-api';

export function useFantasyLeagues(orgId?: string, session?: any) {
  return useQuery({
    queryKey: orgId ? queryKeys.fantasy.leagues(orgId) : ['fantasy', 'leagues'],
    queryFn: () => fetchFantasyLeagues(orgId, session),
    enabled: Boolean(orgId),
  });
}
