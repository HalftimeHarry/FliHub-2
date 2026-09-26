export interface PlayerDto {
  readonly id: string;
  readonly brand?: string;
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
  readonly brand?: string;
  readonly malePlayerId: string;
  readonly femalePlayerId: string;
}

export interface FantasyLeagueDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly brand?: string;
  readonly participantIds: readonly string[];
  readonly ownerUserId?: string;
  readonly requiredApprovedParticipants?: number;
  readonly maxParticipants?: number;
  readonly status?: 'draft' | 'open';
}

export interface FantasyMembershipDto {
  readonly id: string;
  readonly leagueId: string;
  readonly userId: string;
  readonly role: 'owner' | 'participant';
  readonly state: 'pending' | 'approved' | 'rejected' | 'left' | 'banned';
  readonly requestedAt: string;
  readonly reviewedAt?: string;
  readonly reviewedByUserId?: string;
  readonly note?: string;
}

export interface FantasyTournamentDto {
  readonly id: string;
  readonly leagueId: string;
  readonly seasonId: string;
  readonly tournamentNumber: number;
  readonly name: string;
  readonly status: 'draft_pending' | 'scheduled' | 'in_progress' | 'completed';
  readonly participantIds: readonly string[];
  readonly draftRoomId?: string;
  readonly scheduledAt?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly realTournamentId?: string;
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
  readonly brand?: string;
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
  readonly brand?: string;
  readonly type: 'fli' | 'multi-round';
  readonly scheduledOn?: string;
  readonly scoringHoleCount?: number;
  readonly status?: TournamentStatus;
  readonly courseId?: string;
}

export interface TournamentTeeGroupDto {
  readonly id: string;
  readonly number: number;
  readonly teeTime: string;
  readonly teamIds: readonly string[];
  readonly teamNames: readonly string[];
  readonly scorekeeperId?: string;
  readonly scorekeeperName?: string;
}

export interface TournamentTeeGroupScorecardDto {
  readonly groupId: string;
  readonly tournamentId: string;
  readonly tournamentName: string;
  readonly courseName: string;
  readonly holeCount: number;
  readonly players: readonly {
    readonly id: string;
    readonly name: string;
    readonly teamName: string;
  }[];
  readonly holes: readonly {
    readonly number: number;
    readonly name: string;
    readonly par: number;
    readonly distanceFeet?: number;
  }[];
  readonly scores: readonly {
    readonly holeNumber: number;
    readonly playerId: string;
    readonly strokes: number;
  }[];
}

export interface SeasonDto {
  readonly id: string;
  readonly leagueId: string;
  readonly name: string;
  readonly brand?: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly yearlyPurseMinorUnits: number;
  readonly yearlyPurseCurrency: string;
  readonly status: 'current' | 'upcoming' | 'completed';
}

export interface CourseDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly brand?: string;
  readonly holeCount: number;
}

export interface HoleDto {
  readonly id: string;
  readonly courseId: string;
  readonly brand?: string;
  readonly number: number;
  readonly par: number;
  readonly name?: string;
  readonly description?: string;
  readonly distanceFeet?: number;
  readonly blueBasket: boolean;
}

export interface TournamentRegistrationDto {
  readonly id: string;
  readonly tournamentId: string;
  readonly playerId: string;
  readonly brand?: string;
  readonly registeredAt: string;
}

export interface DepartmentDto {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly brand?: string;
  readonly headName?: string;
}

export interface ProjectDto {
  readonly id: string;
  readonly departmentId: string;
  readonly name: string;
  readonly brand?: string;
}

export interface ReimbursementClaimDto {
  readonly id: string;
  readonly claimantId: string;
  readonly departmentId: string;
  readonly projectId: string | undefined;
  readonly totalMinorUnits: number;
  readonly currency: string;
  readonly brand?: string;
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
  readonly canScorekeep?: boolean;
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

export const isCustomOrganization = (
  organizationId: string,
  storage: Storage | undefined = getStorage()
): boolean =>
  readCustomOrganizations(storage).some(
    (organization) => organization.id === organizationId
  );

export const deleteCustomOrganization = (
  organizationId: string,
  storage: Storage | undefined = getStorage()
): void => {
  if (!isCustomOrganization(organizationId, storage) || storage === undefined) {
    throw new Error('Only locally registered organizations can be deleted.');
  }

  storage.setItem(
    customOrganizationsStorageKey,
    JSON.stringify(
      readCustomOrganizations(storage).filter(
        (organization) => organization.id !== organizationId
      )
    )
  );
  storage.setItem(
    customUsersStorageKey,
    JSON.stringify(
      readCustomUsers(storage).filter(
        (user) => user.organizationId !== organizationId
      )
    )
  );
  storage.setItem(
    customDepartmentsStorageKey,
    JSON.stringify(
      readCustomDepartments(storage).filter(
        (department) => department.organizationId !== organizationId
      )
    )
  );
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
    id: 'simon-lizotte',
    name: 'Simon Lizotte',
    organizationId: 'fgl',
    role: 'player',
    playerId: 'simon-lizotte'
  },
  {
    id: 'kat-mertsch',
    name: 'Kat Mertsch',
    organizationId: 'fgl',
    role: 'player',
    playerId: 'kat-mertsch'
  },
  {
    id: 'staff-1',
    name: 'Jamie Chen',
    organizationId: 'fgl',
    role: 'business_staff'
  },
  {
    id: 'staff-2',
    name: 'Taylor Morgan',
    organizationId: 'fgl',
    role: 'business_staff'
  },
  {
    id: 'scorekeeper-1',
    name: 'Priya Desai',
    organizationId: 'fgl',
    role: 'business_staff',
    canScorekeep: true
  },
  {
    id: 'scorekeeper-2',
    name: 'Cameron Holt',
    organizationId: 'fgl',
    role: 'business_staff',
    canScorekeep: true
  },
  {
    id: 'scorekeeper-3',
    name: 'Marisol Vega',
    organizationId: 'fgl',
    role: 'business_staff',
    canScorekeep: true
  },
  {
    id: 'scorekeeper-4',
    name: 'Theo Bennett',
    organizationId: 'fgl',
    role: 'business_staff',
    canScorekeep: true
  },
  {
    id: 'scorekeeper-5',
    name: 'Nina Park',
    organizationId: 'fgl',
    role: 'business_staff',
    canScorekeep: true
  },
  {
    id: 'scorekeeper-6',
    name: 'Owen Grant',
    organizationId: 'fgl',
    role: 'business_staff',
    canScorekeep: true
  },
  {
    id: 'admin-1',
    name: 'Morgan Reyes',
    organizationId: 'fgl',
    role: 'admin'
  },
  {
    id: 'leader-1',
    name: 'Dakota Shaw',
    organizationId: 'fgl',
    role: 'leader'
  },
  {
    id: 'manager-1',
    name: 'Jordan Ellis',
    organizationId: 'fgl',
    role: 'manager'
  },
  {
    id: 'broadcaster-1',
    name: 'Skyler Ames',
    organizationId: 'fgl',
    role: 'broadcaster'
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
      id: 'simon-lizotte',
      displayName: 'Simon Lizotte',
      active: true,
      playerType: 'professional',
      team: 'Ace Makers',
      status: 'active'
    },
    {
      id: 'kat-mertsch',
      displayName: 'Kat Mertsch',
      active: true,
      playerType: 'professional',
      team: 'Ace Makers',
      status: 'active'
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
      type: 'fli',
      scheduledOn: '2026-06-02T22:00:00.000Z',
      scoringHoleCount: 18,
      status: 'scheduled',
      courseId: 'course-1'
    },
    {
      id: 'tournament-2',
      seasonId: 'season-1',
      name: 'Summer Championship',
      type: 'fli',
      scheduledOn: '2026-08-11T22:00:00.000Z',
      scoringHoleCount: 18,
      status: 'scheduled',
      courseId: 'course-2'
    }
  ] satisfies readonly TournamentDto[],
  '/league/seasons': [
    {
      id: 'summer-season',
      leagueId: 'fgl-league',
      name: 'Summer Season',
      brand: 'FLI Golf League',
      startsOn: '2026-05-01T00:00:00.000Z',
      endsOn: '2026-08-31T23:59:59.999Z',
      yearlyPurseMinorUnits: 400_000_000,
      yearlyPurseCurrency: 'USD',
      status: 'current'
    },
    {
      id: 'summer-2-season',
      leagueId: 'fgl-league',
      name: 'Summer 2 Season',
      brand: 'FLI Golf League',
      startsOn: '2027-06-01T00:00:00.000Z',
      endsOn: '2027-08-31T23:59:59.999Z',
      yearlyPurseMinorUnits: 800_000_000,
      yearlyPurseCurrency: 'USD',
      status: 'upcoming'
    }
  ] satisfies readonly SeasonDto[],
  '/league/courses': [
    {
      id: 'course-1',
      organizationId: 'fgl',
      name: 'Turf Paradise',
      holeCount: 9
    },
    {
      id: 'course-2',
      organizationId: 'fgl',
      name: 'Arizona Athletic Grounds',
      holeCount: 9
    }
  ] satisfies readonly CourseDto[],
  '/league/holes': [
    { id: 'course-1-hole-1', courseId: 'course-1', number: 1, par: 3, name: 'Turf Paradise Hole 1', distanceFeet: 215, blueBasket: true },
    { id: 'course-1-hole-2', courseId: 'course-1', number: 2, par: 3, name: 'Turf Paradise Hole 2', distanceFeet: 245, blueBasket: true },
    { id: 'course-1-hole-3', courseId: 'course-1', number: 3, par: 3, name: 'Turf Paradise Hole 3', distanceFeet: 280, blueBasket: true },
    { id: 'course-1-hole-4', courseId: 'course-1', number: 4, par: 3, name: 'Turf Paradise Hole 4', distanceFeet: 260, blueBasket: true },
    { id: 'course-1-hole-5', courseId: 'course-1', number: 5, par: 3, name: 'Turf Paradise Hole 5', distanceFeet: 300, blueBasket: true },
    { id: 'course-1-hole-6', courseId: 'course-1', number: 6, par: 3, name: 'Turf Paradise Hole 6', distanceFeet: 340, blueBasket: true },
    { id: 'course-1-hole-7', courseId: 'course-1', number: 7, par: 3, name: 'Turf Paradise Hole 7', distanceFeet: 270, blueBasket: true },
    { id: 'course-1-hole-8', courseId: 'course-1', number: 8, par: 3, name: 'Turf Paradise Hole 8', distanceFeet: 320, blueBasket: true },
    { id: 'course-1-hole-9', courseId: 'course-1', number: 9, par: 3, name: 'Turf Paradise Hole 9', distanceFeet: 415, blueBasket: true },
    { id: 'course-1-hole-10', courseId: 'course-1', number: 10, par: 3, name: 'Turf Paradise Hole 10', distanceFeet: 220, blueBasket: false },
    { id: 'course-1-hole-11', courseId: 'course-1', number: 11, par: 3, name: 'Turf Paradise Hole 11', distanceFeet: 250, blueBasket: false },
    { id: 'course-1-hole-12', courseId: 'course-1', number: 12, par: 3, name: 'Turf Paradise Hole 12', distanceFeet: 290, blueBasket: false },
    { id: 'course-1-hole-13', courseId: 'course-1', number: 13, par: 3, name: 'Turf Paradise Hole 13', distanceFeet: 270, blueBasket: false },
    { id: 'course-1-hole-14', courseId: 'course-1', number: 14, par: 3, name: 'Turf Paradise Hole 14', distanceFeet: 310, blueBasket: false },
    { id: 'course-1-hole-15', courseId: 'course-1', number: 15, par: 3, name: 'Turf Paradise Hole 15', distanceFeet: 350, blueBasket: false },
    { id: 'course-1-hole-16', courseId: 'course-1', number: 16, par: 3, name: 'Turf Paradise Hole 16', distanceFeet: 280, blueBasket: false },
    { id: 'course-1-hole-17', courseId: 'course-1', number: 17, par: 3, name: 'Turf Paradise Hole 17', distanceFeet: 330, blueBasket: false },
    { id: 'course-1-hole-18', courseId: 'course-1', number: 18, par: 3, name: 'Turf Paradise Hole 18', distanceFeet: 420, blueBasket: false },
    { id: 'course-2-hole-1', courseId: 'course-2', number: 1, par: 3, name: 'Arizona Athletic Grounds Hole 1', distanceFeet: 225, blueBasket: true },
    { id: 'course-2-hole-2', courseId: 'course-2', number: 2, par: 3, name: 'Arizona Athletic Grounds Hole 2', distanceFeet: 250, blueBasket: true },
    { id: 'course-2-hole-3', courseId: 'course-2', number: 3, par: 3, name: 'Arizona Athletic Grounds Hole 3', distanceFeet: 285, blueBasket: true },
    { id: 'course-2-hole-4', courseId: 'course-2', number: 4, par: 3, name: 'Arizona Athletic Grounds Hole 4', distanceFeet: 265, blueBasket: true },
    { id: 'course-2-hole-5', courseId: 'course-2', number: 5, par: 3, name: 'Arizona Athletic Grounds Hole 5', distanceFeet: 305, blueBasket: true },
    { id: 'course-2-hole-6', courseId: 'course-2', number: 6, par: 3, name: 'Arizona Athletic Grounds Hole 6', distanceFeet: 345, blueBasket: true },
    { id: 'course-2-hole-7', courseId: 'course-2', number: 7, par: 3, name: 'Arizona Athletic Grounds Hole 7', distanceFeet: 275, blueBasket: true },
    { id: 'course-2-hole-8', courseId: 'course-2', number: 8, par: 3, name: 'Arizona Athletic Grounds Hole 8', distanceFeet: 325, blueBasket: true },
    { id: 'course-2-hole-9', courseId: 'course-2', number: 9, par: 3, name: 'Arizona Athletic Grounds Hole 9', distanceFeet: 410, blueBasket: true },
    { id: 'course-2-hole-10', courseId: 'course-2', number: 10, par: 3, name: 'Arizona Athletic Grounds Hole 10', distanceFeet: 230, blueBasket: false },
    { id: 'course-2-hole-11', courseId: 'course-2', number: 11, par: 3, name: 'Arizona Athletic Grounds Hole 11', distanceFeet: 255, blueBasket: false },
    { id: 'course-2-hole-12', courseId: 'course-2', number: 12, par: 3, name: 'Arizona Athletic Grounds Hole 12', distanceFeet: 295, blueBasket: false },
    { id: 'course-2-hole-13', courseId: 'course-2', number: 13, par: 3, name: 'Arizona Athletic Grounds Hole 13', distanceFeet: 275, blueBasket: false },
    { id: 'course-2-hole-14', courseId: 'course-2', number: 14, par: 3, name: 'Arizona Athletic Grounds Hole 14', distanceFeet: 315, blueBasket: false },
    { id: 'course-2-hole-15', courseId: 'course-2', number: 15, par: 3, name: 'Arizona Athletic Grounds Hole 15', distanceFeet: 355, blueBasket: false },
    { id: 'course-2-hole-16', courseId: 'course-2', number: 16, par: 3, name: 'Arizona Athletic Grounds Hole 16', distanceFeet: 285, blueBasket: false },
    { id: 'course-2-hole-17', courseId: 'course-2', number: 17, par: 3, name: 'Arizona Athletic Grounds Hole 17', distanceFeet: 335, blueBasket: false },
    { id: 'course-2-hole-18', courseId: 'course-2', number: 18, par: 3, name: 'Arizona Athletic Grounds Hole 18', distanceFeet: 425, blueBasket: false }
  ] satisfies readonly HoleDto[],
  '/league/tournament-registrations': [
    {
      id: 'tournament-1:simon-lizotte',
      tournamentId: 'tournament-1',
      playerId: 'simon-lizotte',
      registeredAt: '2026-05-02T10:00:00.000Z'
    },
    {
      id: 'tournament-1:kat-mertsch',
      tournamentId: 'tournament-1',
      playerId: 'kat-mertsch',
      registeredAt: '2026-05-02T10:15:00.000Z'
    },
    {
      id: 'tournament-1:player-3',
      tournamentId: 'tournament-1',
      playerId: 'player-3',
      registeredAt: '2026-05-02T10:30:00.000Z'
    },
    {
      id: 'tournament-1:player-4',
      tournamentId: 'tournament-1',
      playerId: 'player-4',
      registeredAt: '2026-05-02T10:45:00.000Z'
    },
    {
      id: 'tournament-2:simon-lizotte',
      tournamentId: 'tournament-2',
      playerId: 'simon-lizotte',
      registeredAt: '2026-06-04T09:00:00.000Z'
    },
    {
      id: 'tournament-2:kat-mertsch',
      tournamentId: 'tournament-2',
      playerId: 'kat-mertsch',
      registeredAt: '2026-06-04T09:20:00.000Z'
    },
    {
      id: 'tournament-2:player-3',
      tournamentId: 'tournament-2',
      playerId: 'player-3',
      registeredAt: '2026-06-04T09:40:00.000Z'
    }
  ] satisfies readonly TournamentRegistrationDto[],
  '/league/teams': [
    {
      id: 'team-1',
      organizationId: 'fgl',
      name: 'Ace Makers',
      brand: 'Ace Makers',
      malePlayerId: 'simon-lizotte',
      femalePlayerId: 'kat-mertsch'
    }
  ] satisfies readonly TeamDto[],
  '/fantasy/leagues': [
    {
      id: 'fantasy-league-1',
      organizationId: 'fgl',
      name: 'FLI Golf Fantasy',
      participantIds: ['simon-lizotte', 'kat-mertsch']
    }
  ] satisfies readonly FantasyLeagueDto[],
  '/fantasy/teams': [
    {
      id: 'fantasy-team-1',
      fantasyLeagueId: 'fantasy-league-1',
      ownerId: 'simon-lizotte',
      name: "Lizotte's Aces",
      playerIds: ['simon-lizotte', 'kat-mertsch']
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
  'x-user-id': window.localStorage.getItem(userStorageKey) ?? 'simon-lizotte'
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

  const isDemoOrganization = demoOrganizations.some(
    (organization) => organization.id === organizationId
  );
  if (!isDemoOrganization) {
    return [];
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
export const fetchTournamentTeeGroups = (tournamentId: string) =>
  getJson<readonly TournamentTeeGroupDto[]>(
    `/league/tournaments/${tournamentId}/tee-groups`
  );
export const seedTournamentTeeGroups = (tournamentId: string) =>
  postJson<{ readonly tournamentId: string; readonly created: number }>(
    `/league/tournaments/${tournamentId}/tee-groups/seed`,
    {}
  );
export const assignTournamentTeeGroupScorekeeper = (
  tournamentId: string,
  groupId: string,
  scorekeeperId: string | undefined
) =>
  putJson<{}>(
    `/league/tournaments/${tournamentId}/tee-groups/${groupId}/scorekeeper`,
    { scorekeeperId }
  );
export const assignAllTournamentTeeGroupScorekeepers = (tournamentId: string) =>
  postJson<{ readonly assigned: number }>(
    `/league/tournaments/${tournamentId}/tee-groups/scorekeepers/assign-all`,
    {}
  );

export interface SeedTournamentGroupsAndAssignAllScorekeepersDependencies {
  readonly seedTournamentTeeGroups: (
    tournamentId: string
  ) => Promise<{ readonly tournamentId: string; readonly created: number }>;
  readonly assignAllTournamentTeeGroupScorekeepers: (
    tournamentId: string
  ) => Promise<{ readonly assigned: number }>;
  readonly fetchTournamentTeeGroups: (
    tournamentId: string
  ) => Promise<readonly TournamentTeeGroupDto[]>;
}

export const seedTournamentGroupsAndAssignAllScorekeepers = async (
  tournamentId: string,
  deps: SeedTournamentGroupsAndAssignAllScorekeepersDependencies = {
    seedTournamentTeeGroups,
    assignAllTournamentTeeGroupScorekeepers,
    fetchTournamentTeeGroups
  }
): Promise<readonly TournamentTeeGroupDto[]> => {
  await deps.seedTournamentTeeGroups(tournamentId);
  await deps.assignAllTournamentTeeGroupScorekeepers(tournamentId);
  return await deps.fetchTournamentTeeGroups(tournamentId);
};

export interface SeedAllTournamentGroupsAndAssignAllScorekeepersDependencies {
  readonly fetchTournaments: () => Promise<readonly TournamentDto[]>;
  readonly seedAllTournamentTeeGroups: () => Promise<{
    readonly tournaments: number;
    readonly groups: number;
  }>;
  readonly assignAllTournamentTeeGroupScorekeepers: (
    tournamentId: string
  ) => Promise<{ readonly assigned: number }>;
}

export const seedAllTournamentGroupsAndAssignAllScorekeepers = async (
  deps: SeedAllTournamentGroupsAndAssignAllScorekeepersDependencies = {
    fetchTournaments,
    seedAllTournamentTeeGroups,
    assignAllTournamentTeeGroupScorekeepers
  }
): Promise<readonly TournamentDto[]> => {
  await deps.seedAllTournamentTeeGroups();
  const tournaments = await deps.fetchTournaments();
  const eligibleTournaments = tournaments.filter(
    (tournament) => tournament.type === 'fli'
  );
  for (const tournament of eligibleTournaments) {
    await deps.assignAllTournamentTeeGroupScorekeepers(tournament.id);
  }
  return eligibleTournaments;
};
export const fetchTournamentTeeGroupScorecard = (
  tournamentId: string,
  groupId: string
) =>
  getJson<TournamentTeeGroupScorecardDto>(
    `/league/tournaments/${tournamentId}/tee-groups/${groupId}/scorecard`
  );
export const saveTournamentTeeGroupHoleScores = (
  tournamentId: string,
  groupId: string,
  holeNumber: number,
  playerScores: Readonly<Record<string, number>>
) =>
  putJson<{}>(
    `/league/tournaments/${tournamentId}/tee-groups/${groupId}/scorecard/holes/${holeNumber.toString()}`,
    { playerScores }
  );
export const clearTournamentTeeGroups = async (
  tournamentId: string
): Promise<void> => {
  const response = await fetch(`/league/tournaments/${tournamentId}/tee-groups`, {
    method: 'DELETE',
    headers: getOrganizationHeaders()
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      error.message ?? `Request failed (${response.status.toString()})`
    );
  }
};
export const seedAllTournamentTeeGroups = () =>
  postJson<{ readonly tournaments: number; readonly groups: number }>(
    '/league/tournaments/tee-groups/seed-all',
    {}
  );
export const fetchSeasons = () => getJson<readonly SeasonDto[]>('/league/seasons');
export const fetchCourses = () =>
  getJson<readonly CourseDto[]>('/league/courses');
export const fetchHoles = () => getJson<readonly HoleDto[]>('/league/holes');
export const fetchTeams = () => getJson<readonly TeamDto[]>('/league/teams');
export const fetchFantasyLeagues = () =>
  getJson<readonly FantasyLeagueDto[]>('/fantasy/leagues');
export const fetchFantasyMemberships = () =>
  getJson<readonly FantasyMembershipDto[]>('/fantasy/memberships');
export const fetchFantasyTournaments = () =>
  getJson<readonly FantasyTournamentDto[]>('/fantasy/tournaments');
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

const putJson = async <Value>(path: string, body: unknown): Promise<Value> => {
  const response = await fetch(path, {
    method: 'PUT',
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
  readonly seasonId: string;
  readonly courseId: string;
  readonly type: 'fli' | 'multi-round';
  readonly scheduledOn?: string;
}) => postJson<TournamentDto>('/league/tournaments', input);

export const seedSixTournaments = (input: {
  readonly seasonId: string;
  readonly courseId: string;
  readonly type: 'fli' | 'multi-round';
}) => postJson<readonly TournamentDto[]>('/league/tournaments/seed-six', input);

export const updateTournament = (
  tournamentId: string,
  input: Omit<TournamentDto, 'id' | 'scoringHoleCount'>
) => putJson<TournamentDto>(`/league/tournaments/${tournamentId}`, input);

export const deleteTournament = async (tournamentId: string): Promise<void> => {
  const response = await fetch(`/league/tournaments/${tournamentId}`, {
    method: 'DELETE',
    headers: getOrganizationHeaders()
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      error.message ?? `Request failed (${response.status.toString()})`
    );
  }
};

export const deleteTournaments = async (
  tournamentIds: readonly string[]
): Promise<void> => {
  await postJson<undefined>('/league/tournaments/delete-many', {
    tournamentIds
  });
};

export const deleteHoles = async (holeIds: readonly string[]): Promise<void> => {
  await postJson<undefined>('/league/holes/delete-many', { holeIds });
};

export const updateSeason = (
  seasonId: string,
  input: Omit<SeasonDto, 'id' | 'leagueId'>
) => putJson<SeasonDto>(`/league/seasons/${seasonId}`, input);

export const createSeason = (
  input: Omit<SeasonDto, 'id'>
) => postJson<SeasonDto>('/league/seasons', input);

export const deleteSeason = async (seasonId: string): Promise<void> => {
  const response = await fetch(`/league/seasons/${seasonId}`, {
    method: 'DELETE',
    headers: getOrganizationHeaders()
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      error.message ?? `Request failed (${response.status.toString()})`
    );
  }
};

export const addCourse = (input: {
  readonly name: string;
  readonly holeCount?: number;
}) => postJson<CourseDto>('/league/courses', input);

export const updateCourse = (
  courseId: string,
  input: Pick<CourseDto, 'name' | 'holeCount'>
) => putJson<CourseDto>(`/league/courses/${courseId}`, input);

export const deleteCourse = async (courseId: string): Promise<void> => {
  const response = await fetch(`/league/courses/${courseId}`, {
    method: 'DELETE',
    headers: getOrganizationHeaders()
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      error.message ?? `Request failed (${response.status.toString()})`
    );
  }
};

export const addTeam = (input: {
  readonly name: string;
  readonly malePlayerId: string;
  readonly femalePlayerId: string;
}) => postJson<TeamDto>('/league/teams', input);

export const registerPlayerForTournament = (input: {
  readonly playerId: string;
  readonly tournamentId: string;
}) =>
  postJson<TournamentRegistrationDto>(
    '/league/tournament-registrations',
    input
  );

export const addFantasyLeague = (input: {
  readonly name: string;
  readonly participantIds?: readonly string[];
}) => postJson<FantasyLeagueDto>('/fantasy/leagues', input);

export const requestFantasyLeagueMembership = (input: {
  readonly leagueId: string;
  readonly userId?: string;
  readonly role?: 'participant' | 'owner';
}) =>
  postJson<FantasyMembershipDto>(
    `/fantasy/leagues/${input.leagueId}/memberships/request`,
    {
      userId: input.userId,
      role: input.role ?? 'participant'
    }
  );

export const approveFantasyLeagueMembership = (input: {
  readonly leagueId: string;
  readonly membershipId: string;
}) =>
  putJson<{
    readonly membership: FantasyMembershipDto;
    readonly league: {
      readonly id: string;
      readonly organizationId: string;
      readonly name: string;
      readonly ownerUserId: string;
      readonly participantIds: readonly string[];
      readonly requiredApprovedParticipants: number;
      readonly maxParticipants: number;
      readonly status: 'draft' | 'open';
    };
  }>(`/fantasy/leagues/${input.leagueId}/memberships/${input.membershipId}/approve`, {});

export const createFantasyTournament = (
  leagueId: string,
  input: {
    readonly seasonId?: string;
    readonly name?: string;
    readonly tournamentNumber?: number;
    readonly scheduledAt?: string;
  }
) => postJson<FantasyTournamentDto>(`/fantasy/leagues/${leagueId}/tournaments`, input);

export const seedFantasyLeague = (input: {
  readonly name?: string;
  readonly ownerUserId?: string;
  readonly participantUserIds?: readonly string[];
  readonly seasonId?: string;
  readonly tournamentCount?: number;
  readonly timerSeconds?: number;
}) => postJson<{ readonly league: FantasyLeagueDto; readonly memberships: readonly FantasyMembershipDto[]; readonly tournaments: readonly FantasyTournamentDto[]; readonly draft: DraftRoomDto }>('/fantasy/seed-league', input);

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
  readonly blueBasket?: boolean;
}) => postJson<HoleDto>('/league/holes', input);

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
