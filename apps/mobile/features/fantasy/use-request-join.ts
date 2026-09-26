import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { FantasyMembership, JoinFantasyLeagueInput } from '@/types/fantasy';
import { requestJoinFantasyLeague } from './fantasy-api';

export function useRequestJoinLeague(leagueId?: string, session?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['fantasy', 'request-join', leagueId],
    mutationFn: (input: JoinFantasyLeagueInput) =>
      leagueId ? requestJoinFantasyLeague(leagueId, input, session) : Promise.reject(new Error('Missing league ID')),
    onSuccess: (data) => {
      if (!leagueId) {
        return;
      }
      queryClient.setQueryData<FantasyMembership[]>(queryKeys.fantasy.memberships(leagueId), (previous) =>
        previous ? [data, ...previous] : [data]
      );
    },
  });
}
