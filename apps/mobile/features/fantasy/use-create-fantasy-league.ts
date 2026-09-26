import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { CreateFantasyLeagueInput, FantasyLeague } from '@/types/fantasy';
import { createFantasyLeague } from './fantasy-api';

export function useCreateFantasyLeague(orgId?: string, session?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['fantasy', 'create-league'],
    mutationFn: (input: CreateFantasyLeagueInput) => createFantasyLeague(input, session),
    onSuccess: (data) => {
      queryClient.setQueryData<FantasyLeague[]>(queryKeys.fantasy.leagues(orgId ?? 'default'), (previous) =>
        previous ? [data, ...previous] : [data]
      );
    },
  });
}
