import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { FantasyLeague, FantasyMembership } from '@/types/fantasy';
import { approveFantasyMembership } from './fantasy-api';

export function useApproveMembership(leagueId?: string, membershipId?: string, session?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['fantasy', 'approve-membership', leagueId, membershipId],
    mutationFn: () => {
      if (!leagueId || !membershipId) {
        throw new Error('Missing league or membership id');
      }
      return approveFantasyMembership(leagueId, membershipId, session);
    },
    onSuccess: (data) => {
      if (!leagueId) {
        return;
      }

      queryClient.setQueryData<FantasyMembership[]>(queryKeys.fantasy.memberships(leagueId), (previous) =>
        previous
          ? previous.map((membership) =>
              membership.id === data.membership.id ? data.membership : membership
            )
          : [data.membership]
      );

      queryClient.setQueryData<FantasyLeague>(queryKeys.fantasy.league(leagueId), data.league);
    },
  });
}
