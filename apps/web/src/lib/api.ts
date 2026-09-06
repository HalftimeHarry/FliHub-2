export interface PlayerDto {
  readonly id: string;
  readonly displayName: string;
  readonly active: boolean;
  readonly playerType?: 'student' | 'professional';
  readonly gender?: 'male' | 'female';
  readonly schoolId?: string;
  readonly professionalSince?: string;
}

export interface TeamDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly malePlayerId: string;
  readonly femalePlayerId: string;
}

export interface FantasyLeagueDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly participantIds: readonly string[];
}

export interface FantasyTeamDto {
  readonly id: string;
  readonly fantasyLeagueId: string;
  readonly ownerId: string;
  readonly name: string;
  readonly playerIds: readonly string[];
}

export interface DraftPoolPlayerDto {
  readonly id: string;
  readonly gender: 'male' | 'female';
}

export interface DraftPickDto {
  readonly participantId: string;
  readonly playerId: string;
  readonly round: number;
  readonly pickNumber: number;
}

export type DraftStatus = 'pending' | 'in_progress' | 'complete';

export interface DraftRoomDto {
  readonly id: string;
  readonly fantasyLeagueId: string;
  readonly organizationId: string;
  readonly status: DraftStatus;
  readonly locked: boolean;
  readonly currentRound: number;
  readonly rounds: number;
  readonly maxPerGender: number;
  readonly timerSeconds: number;
  readonly secondsRemaining: number;
  readonly onTheClockParticipantId?: string;
  readonly nextParticipantId?: string;
  readonly order: readonly string[];
  readonly pool: readonly DraftPoolPlayerDto[];
  readonly picks: readonly DraftPickDto[];
}

export type TournamentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface TournamentDto {
  readonly id: string;
  readonly seasonId: string;
  readonly name: string;
  readonly capacity: number;
  readonly status?: TournamentStatus;
  readonly courseId?: string;
}

export interface CourseDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly holeCount: number;
}

export interface HoleDto {
  readonly id: string;
  readonly courseId: string;
  readonly number: number;
  readonly par: number;
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
  readonly headName?: string;
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

export type UserRole =
  | 'leader'
  | 'admin'
  | 'business_staff'
  | 'manager'
  | 'player'
  | 'vendor'
  | 'broadcaster';

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
const customOrganizationsStorageKey = 'flihub-custom-organizations';
const customUsersStorageKey = 'flihub-custom-users';
const customDepartmentsStorageKey = 'flihub-custom-departments';

const getStorage = (): Storage | undefined => {
  try {
    return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
      ? globalThis.localStorage
      : undefined;
  } catch {
    return undefined;
  }
};

const readCustomOrganizations = (
  storage: Storage | undefined = getStorage()
): readonly OrganizationDto[] => {
  if (storage === undefined) {
    return [];
  }

  try {
    const rawValue = storage.getItem(customOrganizationsStorageKey);
    if (rawValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (value): value is OrganizationDto =>
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string' &&
        'name' in value &&
        typeof value.name === 'string' &&
        'type' in value &&
        (value.type === 'operator' || value.type === 'school') &&
        'paysTeams' in value &&
        typeof value.paysTeams === 'boolean' &&
        'enabledComponents' in value &&
        Array.isArray(value.enabledComponents)
    );
  } catch {
    return [];
  }
};

export const getOrganizationCatalog = (
  storage: Storage | undefined = getStorage()
): readonly OrganizationDto[] => {
  const customOrganizations = readCustomOrganizations(storage);

  return [
    ...demoOrganizations,
    ...customOrganizations.filter(
      (organization) =>
        !demoOrganizations.some((seeded) => seeded.id === organization.id)
    )
  ];
};

export const registerCustomOrganization = (
  organization: {
    readonly name: string;
    readonly enabledComponents: readonly string[];
  },
  storage: Storage | undefined = getStorage()
): OrganizationDto => {
  const trimmedName = organization.name.trim();

  if (trimmedName.length === 0) {
    throw new Error('Organization name is required.');
  }

  const nextOrganization: OrganizationDto = {
    id: trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `custom-org-${Date.now().toString(36)}`,
    name: trimmedName,
    type: 'school',
    paysTeams: false,
    enabledComponents: [...new Set(organization.enabledComponents)]
  };

  const customOrganizations = readCustomOrganizations(storage);
  const mergedOrganizations = customOrganizations.some(
    (existing) => existing.id === nextOrganization.id
  )
    ? customOrganizations.map((existing) =>
        existing.id === nextOrganization.id ? nextOrganization : existing
      )
    : [...customOrganizations, nextOrganization];

  if (storage !== undefined) {
    storage.setItem(
      customOrganizationsStorageKey,
      JSON.stringify(mergedOrganizations)
    );
  }

  return nextOrganization;
};

const isUserDto = (value: unknown): value is UserDto =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'string' &&
  'name' in value &&
  typeof value.name === 'string' &&
  'organizationId' in value &&
  typeof value.organizationId === 'string' &&
  'role' in value &&
  typeof value.role === 'string';

const readCustomUsers = (
  storage: Storage | undefined = getStorage()
): readonly UserDto[] => {
  if (storage === undefined) {
    return [];
  }

  try {
    const rawValue = storage.getItem(customUsersStorageKey);
    if (rawValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isUserDto);
  } catch {
    return [];
  }
};

export const getUserCatalog = (
  storage: Storage | undefined = getStorage()
): readonly UserDto[] => [...demoUsers, ...readCustomUsers(storage)];

/**
 * Bootstrap an owner/admin for a freshly registered organization so the new
 * workspace immediately has someone who can act (adapted from the
 * FLI-Golf/FliHub "org must have an owner" onboarding concept).
 */
export const createOrganizationAdmin = (
  organizationId: string,
  name: string,
  storage: Storage | undefined = getStorage()
): UserDto => {
  const trimmedName = name.trim() || 'Organization Admin';
  const nextUser: UserDto = {
    id: `${organizationId}-admin`,
    name: trimmedName,
    organizationId,
    role: 'admin'
  };

  const customUsers = readCustomUsers(storage);
  const merged = customUsers.some((existing) => existing.id === nextUser.id)
    ? customUsers.map((existing) =>
        existing.id === nextUser.id ? nextUser : existing
      )
    : [...customUsers, nextUser];

  if (storage !== undefined) {
    storage.setItem(customUsersStorageKey, JSON.stringify(merged));
  }

  return nextUser;
};

const isDepartmentDto = (value: unknown): value is DepartmentDto =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'string' &&
  'organizationId' in value &&
  typeof value.organizationId === 'string' &&
  'name' in value &&
  typeof value.name === 'string';

const readCustomDepartments = (
  storage: Storage | undefined = getStorage()
): readonly DepartmentDto[] => {
  if (storage === undefined) {
    return [];
  }

  try {
    const rawValue = storage.getItem(customDepartmentsStorageKey);
    if (rawValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isDepartmentDto);
  } catch {
    return [];
  }
};

/**
 * Persist the departments (and their heads) captured during organization
 * setup so the workspace immediately reflects the org's structure.
 */
export const registerOrganizationDepartments = (
  organizationId: string,
  departments: readonly { readonly name: string; readonly headName: string }[],
  storage: Storage | undefined = getStorage()
): readonly DepartmentDto[] => {
  const nextDepartments: DepartmentDto[] = departments.map((department) => {
    const slug =
      department.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'department';

    return {
      id: `${organizationId}-${slug}`,
      organizationId,
      name: department.name.trim(),
      headName: department.headName.trim()
    };
  });

  const existing = readCustomDepartments(storage);
  const kept = existing.filter(
    (department) => department.organizationId !== organizationId
  );

  if (storage !== undefined) {
    storage.setItem(
      customDepartmentsStorageKey,
      JSON.stringify([...kept, ...nextDepartments])
    );
  }

  return nextDepartments;
};

export const getOrganizationDepartments = (
  organizationId: string,
  storage: Storage | undefined = getStorage()
): readonly DepartmentDto[] =>
  readCustomDepartments(storage).filter(
    (department) => department.organizationId === organizationId
  );

/**
 * Add a single department to an existing (custom) organization. Appends to the
 * stored departments rather than replacing them, unlike
 * registerOrganizationDepartments which seeds the initial set.
 */
export const addOrganizationDepartment = (
  organizationId: string,
  department: { readonly name: string; readonly headName?: string },
  storage: Storage | undefined = getStorage()
): DepartmentDto => {
  const name = department.name.trim();

  if (name.length < 2) {
    throw new Error('Department name must contain at least two characters.');
  }

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'department';

  const existing = readCustomDepartments(storage);
  const scopeId = `${organizationId}-${slug}`;
  const uniqueId = existing.some((entry) => entry.id === scopeId)
    ? `${scopeId}-${Date.now().toString(36)}`
    : scopeId;

  const nextDepartment: DepartmentDto = {
    id: uniqueId,
    organizationId,
    name,
    headName: department.headName?.trim() ?? ''
  };

  if (storage !== undefined) {
    storage.setItem(
      customDepartmentsStorageKey,
      JSON.stringify([...existing, nextDepartment])
    );
  }

  return nextDepartment;
};

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
      capacity: 32,
      status: 'scheduled',
      courseId: 'course-1'
    },
    {
      id: 'tournament-2',
      seasonId: 'season-1',
      name: 'Summer Championship',
      capacity: 16,
      status: 'scheduled',
      courseId: 'course-2'
    }
  ] satisfies readonly TournamentDto[],
  '/league/courses': [
    {
      id: 'course-1',
      organizationId: 'fgl',
      name: 'Maple Ridge',
      holeCount: 18
    },
    {
      id: 'course-2',
      organizationId: 'fgl',
      name: 'Harbor Point',
      holeCount: 18
    }
  ] satisfies readonly CourseDto[],
  '/league/holes': [
    { id: 'course-1-hole-1', courseId: 'course-1', number: 1, par: 3 },
    { id: 'course-1-hole-2', courseId: 'course-1', number: 2, par: 4 },
    { id: 'course-1-hole-3', courseId: 'course-1', number: 3, par: 5 }
  ] satisfies readonly HoleDto[],
  '/league/tournament-registrations':
    [] satisfies readonly TournamentRegistrationDto[],
  '/league/teams': [
    {
      id: 'team-1',
      organizationId: 'fgl',
      name: 'Rivera & Blake',
      malePlayerId: 'player-1',
      femalePlayerId: 'player-2'
    }
  ] satisfies readonly TeamDto[],
  '/fantasy/leagues': [
    {
      id: 'fantasy-league-1',
      organizationId: 'fgl',
      name: 'FLI Golf Fantasy',
      participantIds: ['player-1', 'player-2']
    }
  ] satisfies readonly FantasyLeagueDto[],
  '/fantasy/teams': [
    {
      id: 'fantasy-team-1',
      fantasyLeagueId: 'fantasy-league-1',
      ownerId: 'player-1',
      name: "Rivera's Aces",
      playerIds: ['player-3', 'player-4']
    }
  ] satisfies readonly FantasyTeamDto[],
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
  const allUsers = getUserCatalog();
  const activeUser = allUsers.find(
    (user) => user.id === window.localStorage.getItem(userStorageKey)
  );
  const organizationId =
    window.localStorage.getItem(organizationStorageKey) ??
    activeUser?.organizationId ??
    'fgl';

  if (path === '/users') {
    return allUsers;
  }
  if (path === '/organization/users') {
    return allUsers.filter((user) => user.organizationId === organizationId);
  }
  if (path === '/organization') {
    return (
      getOrganizationCatalog().find(
        (organization) => organization.id === organizationId
      ) ?? getOrganizationCatalog()[0]
    );
  }

  if (path === '/business/departments') {
    const customDepartments = getOrganizationDepartments(organizationId);
    if (customDepartments.length > 0) {
      return customDepartments;
    }
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
export const fetchCourses = () =>
  getJson<readonly CourseDto[]>('/league/courses');
export const fetchHoles = () => getJson<readonly HoleDto[]>('/league/holes');
export const fetchTeams = () => getJson<readonly TeamDto[]>('/league/teams');
export const fetchFantasyLeagues = () =>
  getJson<readonly FantasyLeagueDto[]>('/fantasy/leagues');
export const fetchFantasyTeams = () =>
  getJson<readonly FantasyTeamDto[]>('/fantasy/teams');
export const fetchDrafts = () =>
  getJson<readonly DraftRoomDto[]>('/fantasy/drafts');
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
export const fetchUsers = async (): Promise<readonly UserDto[]> => {
  const fetched = await getJson<readonly UserDto[]>('/users');
  const customUsers = readCustomUsers();
  const missing = customUsers.filter(
    (custom) => !fetched.some((user) => user.id === custom.id)
  );
  return [...fetched, ...missing];
};
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

  return getOrganizationCatalog();
};

const postJson = async <Value>(
  path: string,
  body: unknown
): Promise<Value> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getOrganizationHeaders()
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      error.message ?? `Request failed (${response.status.toString()})`
    );
  }

  return (await response.json()) as Value;
};

export const addTournament = (input: {
  readonly name: string;
  readonly capacity?: number;
  readonly courseId?: string;
}) => postJson<TournamentDto>('/league/tournaments', input);

export const addCourse = (input: {
  readonly name: string;
  readonly holeCount?: number;
}) => postJson<CourseDto>('/league/courses', input);

export const addTeam = (input: {
  readonly name: string;
  readonly malePlayerId: string;
  readonly femalePlayerId: string;
}) => postJson<TeamDto>('/league/teams', input);

export const addFantasyLeague = (input: {
  readonly name: string;
  readonly participantIds?: readonly string[];
}) => postJson<FantasyLeagueDto>('/fantasy/leagues', input);

export const addFantasyTeam = (input: {
  readonly fantasyLeagueId: string;
  readonly ownerId: string;
  readonly name: string;
  readonly playerIds?: readonly string[];
}) => postJson<FantasyTeamDto>('/fantasy/teams', input);

export const addHole = (input: {
  readonly courseId: string;
  readonly number?: number;
  readonly par?: number;
}) => postJson<HoleDto>('/league/holes', input);

export interface LeagueSeedResult {
  readonly organizationId: string;
  readonly created: {
    readonly tournaments: readonly string[];
    readonly courses: readonly string[];
    readonly holes: number;
    readonly teams: readonly string[];
  };
}

export const seedLeague = (input: {
  readonly tournaments?: number;
  readonly courses?: number;
  readonly holesPerCourse?: number;
  readonly tournamentCapacity?: number;
  readonly teams?: number;
}) => postJson<LeagueSeedResult>('/league/seed', input);

export interface FantasySeedResult {
  readonly organizationId: string;
  readonly created: {
    readonly leagues: readonly string[];
    readonly teams: readonly string[];
  };
}

export const seedFantasy = (input: {
  readonly leagues?: number;
  readonly teamsPerLeague?: number;
}) => postJson<FantasySeedResult>('/fantasy/seed', input);

export const createDraft = (input: {
  readonly fantasyLeagueId: string;
  readonly participantIds: readonly string[];
  readonly poolPlayerIds: readonly string[];
  readonly timerSeconds?: number;
}) => postJson<DraftRoomDto>('/fantasy/drafts', input);

export const openDraft = (draftId: string) =>
  postJson<DraftRoomDto>(`/fantasy/drafts/${draftId}/open`, {});

export const makeDraftPick = (
  draftId: string,
  input: { readonly participantId: string; readonly playerId: string }
) => postJson<DraftRoomDto>(`/fantasy/drafts/${draftId}/pick`, input);
