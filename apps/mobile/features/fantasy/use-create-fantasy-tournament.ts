import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { CreateFantasyTournamentInput, FantasyTournament } from '@/types/fantasy';
import { createFantasyTournament } from './fantasy-api';

export function useCreateFantasyTournament(leagueId?: string, session?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['fantasy', 'create-tournament', leagueId],
    mutationFn: (input: CreateFantasyTournamentInput) =>
      leagueId ? createFantasyTournament(leagueId, input, session) : Promise.reject(new Error('Missing league ID')),
    onSuccess: (data) => {
      if (!leagueId) {
        return;
      }
      queryClient.setQueryData<FantasyTournament[]>(queryKeys.fantasy.tournaments(leagueId), (previous) =>
        previous ? [data, ...previous] : [data]
      );
    },
  });
}
