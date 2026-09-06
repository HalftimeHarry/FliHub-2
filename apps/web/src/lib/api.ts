export interface PlayerDto {
  readonly id: string;
  readonly displayName: string;
  readonly active: boolean;
}

export interface TournamentDto {
  readonly id: string;
  readonly seasonId: string;
  readonly name: string;
  readonly capacity: number;
}

export interface TournamentRegistrationDto {
  readonly id: string;
  readonly tournamentId: string;
  readonly playerId: string;
  readonly registeredAt: string;
}

export interface DepartmentDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
}

export interface ProjectDto {
  readonly id: string;
  readonly departmentId: string;
  readonly name: string;
}

export interface ReimbursementClaimDto {
  readonly id: string;
  readonly claimantId: string;
  readonly departmentId: string;
  readonly projectId: string | undefined;
  readonly totalMinorUnits: number;
  readonly currency: string;
  readonly status: string;
}

export type UserRole = 'player' | 'business_staff' | 'admin';

export interface UserDto {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;
  readonly role: UserRole;
  readonly playerId?: string;
}

const userStorageKey = 'flihub-active-user';

export const getOrganizationHeaders = (): Record<string, string> => ({
  'x-user-id': window.localStorage.getItem(userStorageKey) ?? 'player-1'
});

export const setActiveUser = (userId: string): void => {
  window.localStorage.setItem(userStorageKey, userId);
};

const getJson = async <Value>(path: string): Promise<Value> => {
  const response = await fetch(path, {
    headers: getOrganizationHeaders()
  });
  return (await response.json()) as Value;
};

export const fetchPlayers = () =>
  getJson<readonly PlayerDto[]>('/league/players');
export const fetchTournaments = () =>
  getJson<readonly TournamentDto[]>('/league/tournaments');
export const fetchTournamentRegistrations = () =>
  getJson<readonly TournamentRegistrationDto[]>(
    '/league/tournament-registrations'
  );
export const fetchDepartments = () =>
  getJson<readonly DepartmentDto[]>('/business/departments');
export const fetchProjects = () =>
  getJson<readonly ProjectDto[]>('/business/projects');
export const fetchReimbursementClaims = () =>
  getJson<readonly ReimbursementClaimDto[]>('/business/reimbursement-claims');
export const fetchUsers = () => getJson<readonly UserDto[]>('/users');
export const fetchOrganizationUsers = () =>
  getJson<readonly UserDto[]>('/organization/users');
