import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { fetchOrganizations } from './organization-api';

export function useOrganizationSummary(orgId?: string) {
  return useQuery({
    queryKey: orgId ? queryKeys.org.summary(orgId) : ['org', 'summary'],
    queryFn: fetchOrganizations,
    enabled: Boolean(orgId),
  });
}
