import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { DraftPickInput, DraftRoom } from '@/types/fantasy';
import { fetchDraftRoom, submitDraftPick } from './fantasy-api';

export function useDraftRoom(draftId?: string, session?: any) {
  return useQuery({
    queryKey: draftId ? queryKeys.fantasy.draft(draftId) : ['fantasy', 'draft'],
    queryFn: () => (draftId ? fetchDraftRoom(draftId, session) : Promise.resolve(null)),
    enabled: Boolean(draftId),
  });
}

export function useSubmitDraftPick(draftId?: string, session?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['fantasy', 'draft', draftId, 'pick'],
    mutationFn: (input: DraftPickInput) =>
      draftId ? submitDraftPick(draftId, input, session) : Promise.reject(new Error('Missing draft ID')),
    onSuccess: (data) => {
      if (!draftId) {
        return;
      }
      queryClient.setQueryData<DraftRoom>(queryKeys.fantasy.draft(draftId), data);
    },
  });
}
