export interface PlayerDto {
  readonly id: string;
  readonly displayName: string;
  readonly active: boolean;
  readonly playerType?: 'student' | 'professional';
  readonly schoolId?: string;
  readonly professionalSince?: string;
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

export interface OrganizationDto {
  readonly id: string;
  readonly name: string;
  readonly type: 'operator' | 'school';
  readonly paysTeams: boolean;
  readonly enabledComponents: readonly string[];
}

const userStorageKey = 'flihub-active-user';
const organizationStorageKey = 'flihub-active-organization';

const demoUsers: readonly UserDto[] = [
  {
    id: 'player-1',
    name: 'Alex Rivera',
    organizationId: 'fgl',
    role: 'player',
    playerId: 'player-1'
  },
  {
    id: 'player-2',
    name: 'Jordan Blake',
    organizationId: 'fgl',
    role: 'player',
    playerId: 'player-2'
  },
  {
    id: 'staff-1',
    name: 'Jamie Chen',
    organizationId: 'fgl',
    role: 'business_staff'
  },
  {
    id: 'admin-1',
    name: 'Morgan Reyes',
    organizationId: 'fgl',
    role: 'admin'
  },
  {
    id: 'staff-3',
    name: 'Riley Patel',
    organizationId: 'org-2',
    role: 'business_staff'
  }
];

const demoOrganizations: OrganizationDto[] = [
  {
    id: 'fgl',
    name: 'FLI Golf',
    type: 'operator',
    paysTeams: true,
    enabledComponents: [
      'league-operations',
      'fli-golf-format',
      'fantasy',
      'payouts',
      'teams-and-rosters',
      'courses-and-scoring',
      'sponsorship',
      'community-content'
    ]
  },
  {
    id: 'org-2',
    name: 'Example School',
    type: 'school',
    paysTeams: false,
    enabledComponents: [
      'league-operations',
      'fli-golf-format',
      'teams-and-rosters',
      'courses-and-scoring'
    ]
  },
  {
    id: 'org-custom',
    name: 'Custom Demo League',
    type: 'school',
    paysTeams: false,
    enabledComponents: [
      'league-operations',
      'fli-golf-format',
      'teams-and-rosters',
      'courses-and-scoring',
      'sponsorship'
    ]
  }
];

const demoData: Record<string, unknown> = {
  '/league/players': [
    {
      id: 'player-1',
      displayName: 'Alex Rivera',
      active: true,
      playerType: 'professional'
    },
    {
      id: 'player-2',
      displayName: 'Jordan Blake',
      active: true,
      playerType: 'professional'
    },
    {
      id: 'player-3',
      displayName: 'Sam Okafor',
      active: true,
      playerType: 'professional'
    },
    {
      id: 'player-4',
      displayName: 'Casey Nguyen',
      active: true,
      playerType: 'professional'
    },
    {
      id: 'player-5',
      displayName: 'Morgan Lee',
      active: false,
      playerType: 'professional'
    }
  ] satisfies readonly PlayerDto[],
  '/league/tournaments': [
    {
      id: 'tournament-1',
      seasonId: 'season-1',
      name: 'Spring Open',
      capacity: 32
    },
    {
      id: 'tournament-2',
      seasonId: 'season-1',
      name: 'Summer Championship',
      capacity: 16
    }
  ] satisfies readonly TournamentDto[],
  '/league/tournament-registrations':
    [] satisfies readonly TournamentRegistrationDto[],
  '/business/departments': [
    { id: 'department-1', organizationId: 'fgl', name: 'Operations' },
    { id: 'department-2', organizationId: 'fgl', name: 'Marketing' },
    { id: 'department-3', organizationId: 'fgl', name: 'Player Development' }
  ] satisfies readonly DepartmentDto[],
  '/business/projects': [
    {
      id: 'project-1',
      departmentId: 'department-1',
      name: 'Tournament Launch'
    },
    {
      id: 'project-2',
      departmentId: 'department-2',
      name: 'Season Media Campaign'
    },
    { id: 'project-3', departmentId: 'department-3', name: 'Coaching Clinics' }
  ] satisfies readonly ProjectDto[],
  '/business/reimbursement-claims':
    [] satisfies readonly ReimbursementClaimDto[]
};

export const getOrganizationHeaders = (): Record<string, string> => ({
  'x-user-id': window.localStorage.getItem(userStorageKey) ?? 'player-1'
});

export const setActiveUser = (userId: string): void => {
  window.localStorage.setItem(userStorageKey, userId);
};

export const setActiveOrganization = (organizationId: string): void => {
  window.localStorage.setItem(organizationStorageKey, organizationId);
};

const getDemoJson = (path: string): unknown => {
  const activeUser = demoUsers.find(
    (user) => user.id === window.localStorage.getItem(userStorageKey)
  );
  const organizationId =
    window.localStorage.getItem(organizationStorageKey) ??
    activeUser?.organizationId ??
    'fgl';

  if (path === '/users') {
    return demoUsers;
  }
  if (path === '/organization/users') {
    return demoUsers.filter((user) => user.organizationId === organizationId);
  }
  if (path === '/organization') {
    return (
      demoOrganizations.find(
        (organization) => organization.id === organizationId
      ) ?? demoOrganizations[0]
    );
  }

  return demoData[path] ?? [];
};

const getJson = async <Value>(path: string): Promise<Value> => {
  try {
    const response = await fetch(path, {
      headers: getOrganizationHeaders()
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !contentType.includes('application/json')) {
      return getDemoJson(path) as Value;
    }
    return (await response.json()) as Value;
  } catch {
    return getDemoJson(path) as Value;
  }
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
export const fetchOrganization = () =>
  getJson<OrganizationDto>('/organization');

export const seedDefaultOrganizations = async (): Promise<
  readonly OrganizationDto[]
> => {
  try {
    const response = await fetch('/organization/seed', {
      method: 'POST',
      headers: getOrganizationHeaders()
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('application/json')) {
      return (await response.json()) as readonly OrganizationDto[];
    }
  } catch {
    // The in-memory demo fallback below is used when the API is not running.
  }

  return demoOrganizations;
};
