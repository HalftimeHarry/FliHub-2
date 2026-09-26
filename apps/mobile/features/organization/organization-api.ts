import { apiRequest } from '@/services/api/client';
import type { OrganizationSummary } from '@/types/org';

export async function fetchOrganizations() {
  return apiRequest<OrganizationSummary[]>('/organization');
}
