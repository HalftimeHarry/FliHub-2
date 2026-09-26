import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { FantasyLeague, SeedLeagueInput } from '@/types/fantasy';
import { seedLeague } from './fantasy-api';

export function useSeedLeague(session?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['fantasy', 'seed-league'],
    mutationFn: (input: SeedLeagueInput) => seedLeague(input, session),
    onSuccess: (data) => {
      queryClient.setQueryData<FantasyLeague[]>(queryKeys.fantasy.leagues('default'), (previous) =>
        previous ? [data, ...previous] : [data]
      );
    },
  });
}
