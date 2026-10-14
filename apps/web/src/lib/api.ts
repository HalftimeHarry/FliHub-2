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

export interface SponsorshipTierDto {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly minAmount: number;
  readonly maxAmount: number | null;
  readonly benefits: readonly string[];
}

export interface SponsorDto {
  readonly id: string;
  readonly name: string;
  readonly brandName: string;
  readonly category: string;
  readonly logoUrl?: string;
  readonly status: 'active' | 'lead' | 'proposal' | 'inactive';
}

export interface SponsorshipDealDto {
  readonly id: string;
  readonly sponsorId: string;
  readonly targetType: 'season' | 'tournament';
  readonly targetId: string;
  readonly tierId: string;
  readonly status: 'lead' | 'proposal' | 'active' | 'paid';
  readonly contractValue: number;
  readonly isTitleSponsor?: boolean;
}

export interface TicketTypeDto {
  readonly id: string;
  readonly tournamentId: string;
  readonly name: string;
  readonly priceMinorUnits: number;
  readonly currency: string;
  readonly capacity?: number;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface TicketPurchaseDto {
  readonly id: string;
  readonly ticketTypeId: string;
  readonly quantity: number;
  readonly unitPriceMinorUnits: number;
  readonly totalMinorUnits: number;
  readonly currency: string;
  readonly purchaserName: string;
  readonly purchaserEmail?: string;
  readonly purchaserPhone?: string;
  readonly source: 'demo' | 'checkout';
  readonly status: 'pending' | 'paid' | 'cancelled';
  readonly createdAt: string;
}

export const formatDateOnlyUtc = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

export const formatDateInputValueUtc = (value: string): string => {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export type TitleSponsorStatus =
  | 'confirmed'
  | 'prospective'
  | 'not-assigned'
  | 'conflict';

export interface TitleSponsorResolution {
  readonly status: TitleSponsorStatus;
  readonly label: string;
  readonly sponsor?: SponsorDto;
  readonly deal?: SponsorshipDealDto;
  readonly deals: readonly SponsorshipDealDto[];
}

export const resolveTitleSponsorForTarget = ({
  targetType,
  targetId,
  sponsors,
  deals
}: {
  readonly targetType: 'season' | 'tournament';
  readonly targetId: string;
  readonly sponsors: readonly SponsorDto[];
  readonly deals: readonly SponsorshipDealDto[];
}): TitleSponsorResolution => {
  const titleDeals = deals.filter(
    (deal) =>
      deal.targetType === targetType &&
      deal.targetId === targetId &&
      deal.isTitleSponsor === true
  );

  if (titleDeals.length === 0) {
    return {
      status: 'not-assigned',
      label: 'Not assigned',
      deals: []
    };
  }

  const confirmedDeals = titleDeals.filter(
    (deal) => deal.status === 'active' || deal.status === 'paid'
  );

  if (confirmedDeals.length > 1) {
    return {
      status: 'conflict',
      label: 'Title sponsor conflict',
      deals: confirmedDeals
    };
  }

  if (confirmedDeals.length === 1) {
    const sponsor = sponsors.find((candidate) => candidate.id === confirmedDeals[0]?.sponsorId);

    return {
      status: 'confirmed',
      label: 'Title sponsor',
      sponsor,
      deal: confirmedDeals[0],
      deals: confirmedDeals
    };
  }

  const prospectiveDeals = titleDeals.filter(
    (deal) => deal.status === 'lead' || deal.status === 'proposal'
  );

  if (prospectiveDeals.length > 0) {
    const sponsor = sponsors.find((candidate) => candidate.id === prospectiveDeals[0]?.sponsorId);

    return {
      status: 'prospective',
      label: 'Prospective title sponsor',
      sponsor,
      deal: prospectiveDeals[0],
      deals: prospectiveDeals
    };
  }

  return {
    status: 'not-assigned',
    label: 'Not assigned',
    deals: titleDeals
  };
};

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

const demoSeasonResetStorageKey = 'flihub-demo-season-sponsor-reset';
const demoSeasonsStorageKey = 'flihub-demo-seasons';
const demoSponsorshipTiersStorageKey = 'flihub-demo-sponsorship-tiers';
const demoSponsorsStorageKey = 'flihub-demo-sponsors';
const demoSponsorshipDealsStorageKey = 'flihub-demo-sponsorship-deals';

const getPersistedDemoCollection = <Value>(
  key: string,
  fallback: readonly Value[]
): readonly Value[] => {
  const storage = getStorage();
  if (storage === undefined) {
    return fallback;
  }

  try {
    const rawValue = storage.getItem(key);
    if (rawValue === null) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue) ? (parsedValue as Value[]) : fallback;
  } catch {
    return fallback;
  }
};

const defaultSeasonSeed: readonly SeasonDto[] = [
  {
    id: 'summer-2027',
    leagueId: 'fgl-league',
    name: 'Summer Season',
    brand: 'FLI Golf League',
    startsOn: '2027-05-31T00:00:00.000Z',
    endsOn: '2027-08-31T23:59:59.999Z',
    yearlyPurseMinorUnits: 400_000_000,
    yearlyPurseCurrency: 'USD',
    status: 'current'
  },
  {
    id: 'fall-2027',
    leagueId: 'fgl-league',
    name: 'Fall Season',
    brand: 'FLI Golf League',
    startsOn: '2027-09-12T00:00:00.000Z',
    endsOn: '2027-12-13T23:59:59.999Z',
    yearlyPurseMinorUnits: 800_000_000,
    yearlyPurseCurrency: 'USD',
    status: 'upcoming'
  }
];

const defaultSponsorshipTierSeed: readonly SponsorshipTierDto[] = [
  {
    id: 'tier-title',
    name: 'Title Sponsor',
    shortName: 'Title',
    minAmount: 1_000_000,
    maxAmount: null,
    benefits: ['Primary league branding', 'Presenting sponsor recognition', 'VIP hospitality access']
  },
  {
    id: 'tier-major',
    name: 'Major Sponsor',
    shortName: 'Major',
    minAmount: 100_000,
    maxAmount: 999_999,
    benefits: ['Season visibility', 'Featured brand placement', 'Event activation rights']
  },
  {
    id: 'tier-gold',
    name: 'Gold',
    shortName: 'Gold',
    minAmount: 10_000,
    maxAmount: 99_999,
    benefits: ['Tournament signage', 'Digital sponsor recognition', 'Activation area inclusion']
  }
];

const defaultSponsorSeed: readonly SponsorDto[] = [
  {
    id: 'sponsor-young-america-capital',
    name: 'Young America Capital',
    brandName: 'Young America Capital',
    category: 'Capital',
    logoUrl: '/brand/sponsors/summit-capital/full-logo.svg',
    status: 'active'
  },
  {
    id: 'sponsor-sccg-management',
    name: 'SCCG Management',
    brandName: 'SCCG Management',
    category: 'Management',
    logoUrl: '/brand/sponsors/harbor-financial/full-logo.svg',
    status: 'active'
  },
  {
    id: 'sponsor-neology',
    name: 'Neology',
    brandName: 'Neology',
    category: 'Technology',
    logoUrl: '/brand/sponsors/greenline-logistics/full-logo.svg',
    status: 'active'
  },
  {
    id: 'sponsor-go-throw',
    name: 'Go Throw',
    brandName: 'Go Throw',
    category: 'Touring',
    logoUrl: '/brand/sponsors/northstar-bank/full-logo.svg',
    status: 'active'
  },
  {
    id: 'sponsor-coghlan-technology-group',
    name: 'Coghlan Technology Group',
    brandName: 'Coghlan Technology Group',
    category: 'Technology',
    logoUrl: '/brand/sponsors/coastal-energy/full-logo.svg',
    status: 'active'
  },
  {
    id: 'sponsor-americas-mobile',
    name: 'Americas Mobile',
    brandName: 'Americas Mobile',
    category: 'Telecom',
    status: 'active'
  },
  {
    id: 'sponsor-pure-mobile-productions',
    name: 'Pure Mobile Productions',
    brandName: 'Pure Mobile Productions',
    category: 'Media',
    status: 'active'
  },
  {
    id: 'sponsor-smart-boost',
    name: 'Smart Boost',
    brandName: 'Smart Boost',
    category: 'Technology',
    status: 'active'
  }
];

const defaultSponsorshipDealSeed: readonly SponsorshipDealDto[] = [
  {
    id: 'deal-summer-2027-title',
    sponsorId: 'sponsor-young-america-capital',
    targetType: 'season',
    targetId: 'summer-2027',
    tierId: 'tier-title',
    status: 'active',
    contractValue: 1_000_000,
    isTitleSponsor: true
  },
  {
    id: 'deal-summer-2027-major',
    sponsorId: 'sponsor-neology',
    targetType: 'season',
    targetId: 'summer-2027',
    tierId: 'tier-major',
    status: 'active',
    contractValue: 250_000
  },
  {
    id: 'deal-summer-2027-gold',
    sponsorId: 'sponsor-go-throw',
    targetType: 'season',
    targetId: 'summer-2027',
    tierId: 'tier-gold',
    status: 'active',
    contractValue: 45_000
  },
  {
    id: 'deal-fall-2027-title',
    sponsorId: 'sponsor-sccg-management',
    targetType: 'season',
    targetId: 'fall-2027',
    tierId: 'tier-title',
    status: 'proposal',
    contractValue: 1_000_000,
    isTitleSponsor: true
  },
  {
    id: 'deal-fall-2027-major',
    sponsorId: 'sponsor-coghlan-technology-group',
    targetType: 'season',
    targetId: 'fall-2027',
    tierId: 'tier-major',
    status: 'lead',
    contractValue: 300_000
  },
  {
    id: 'deal-fall-2027-mobile',
    sponsorId: 'sponsor-americas-mobile',
    targetType: 'season',
    targetId: 'fall-2027',
    tierId: 'tier-gold',
    status: 'active',
    contractValue: 35_000
  },
  {
    id: 'deal-fall-2027-media',
    sponsorId: 'sponsor-pure-mobile-productions',
    targetType: 'season',
    targetId: 'fall-2027',
    tierId: 'tier-gold',
    status: 'active',
    contractValue: 25_000
  },
  {
    id: 'deal-summer-2027-smart-boost',
    sponsorId: 'sponsor-smart-boost',
    targetType: 'season',
    targetId: 'summer-2027',
    tierId: 'tier-gold',
    status: 'active',
    contractValue: 20_000
  }
];

const defaultTicketTypeSeed: readonly TicketTypeDto[] = [
  {
    id: 'ticket-general-tournament-1',
    tournamentId: 'tournament-1',
    name: 'General Admission',
    priceMinorUnits: 4500,
    currency: 'USD',
    capacity: 200,
    active: true,
    createdAt: '2027-05-01T00:00:00.000Z'
  },
  {
    id: 'ticket-vip-tournament-1',
    tournamentId: 'tournament-1',
    name: 'VIP',
    priceMinorUnits: 12000,
    currency: 'USD',
    capacity: 40,
    active: true,
    createdAt: '2027-05-01T00:00:00.000Z'
  },
  {
    id: 'ticket-general-tournament-2',
    tournamentId: 'tournament-2',
    name: 'General Admission',
    priceMinorUnits: 5000,
    currency: 'USD',
    capacity: 150,
    active: true,
    createdAt: '2027-05-02T00:00:00.000Z'
  }
] satisfies readonly TicketTypeDto[];

const defaultTicketPurchaseSeed: readonly TicketPurchaseDto[] = [
  {
    id: 'ticket-purchase-1',
    ticketTypeId: 'ticket-general-tournament-1',
    quantity: 2,
    unitPriceMinorUnits: 4500,
    totalMinorUnits: 9000,
    currency: 'USD',
    purchaserName: 'Dana Patel',
    purchaserEmail: 'dana@example.com',
    source: 'demo',
    status: 'paid',
    createdAt: '2027-05-07T19:00:00.000Z'
  },
  {
    id: 'ticket-purchase-2',
    ticketTypeId: 'ticket-vip-tournament-1',
    quantity: 1,
    unitPriceMinorUnits: 12000,
    totalMinorUnits: 12000,
    currency: 'USD',
    purchaserName: 'Mason Cruz',
    purchaserEmail: 'mason@example.com',
    source: 'checkout',
    status: 'pending',
    createdAt: '2027-05-09T12:30:00.000Z'
  }
] satisfies readonly TicketPurchaseDto[];

const readPersistedDemoArray = <Value>(
  key: string,
  fallback: readonly Value[],
  storage: Storage | undefined = getStorage()
): readonly Value[] => {
  if (storage === undefined) {
    return fallback;
  }

  try {
    const rawValue = storage.getItem(key);
    if (rawValue === null) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue) ? (parsedValue as Value[]) : fallback;
  } catch {
    return fallback;
  }
};

export const resetDemoSeasonAndSponsorData = (
  storage: Storage | undefined = getStorage()
): {
  readonly seasons: readonly SeasonDto[];
  readonly tiers: readonly SponsorshipTierDto[];
  readonly sponsors: readonly SponsorDto[];
  readonly deals: readonly SponsorshipDealDto[];
} => {
  const nextSeasons = [...defaultSeasonSeed];
  const nextTiers = [...defaultSponsorshipTierSeed];
  const nextSponsors = [...defaultSponsorSeed];
  const nextDeals = [...defaultSponsorshipDealSeed];

  if (storage !== undefined) {
    storage.setItem(demoSeasonsStorageKey, JSON.stringify(nextSeasons));
    storage.setItem(demoSponsorshipTiersStorageKey, JSON.stringify(nextTiers));
    storage.setItem(demoSponsorsStorageKey, JSON.stringify(nextSponsors));
    storage.setItem(demoSponsorshipDealsStorageKey, JSON.stringify(nextDeals));
    storage.setItem(
      demoSeasonResetStorageKey,
      JSON.stringify({ refreshedAt: new Date().toISOString() })
    );
  }

  demoData['/league/seasons'] = nextSeasons;
  demoData['/sponsorship/tiers'] = nextTiers;
  demoData['/sponsorship/sponsors'] = nextSponsors;
  demoData['/sponsorship/deals'] = nextDeals;

  return {
    seasons: nextSeasons,
    tiers: nextTiers,
    sponsors: nextSponsors,
    deals: nextDeals
  };
};


const defaultTournamentSeedForDemo: readonly TournamentDto[] = [
  {
    id: 'sunset-open',
    seasonId: 'summer-2027',
    name: 'Summer Season • June 2 at Turf Paradise',
    type: 'fli',
    scheduledOn: '2027-06-02T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-1'
  },
  {
    id: 'summer-2027-turf-06-16',
    seasonId: 'summer-2027',
    name: 'Summer Season • June 16 at Turf Paradise',
    type: 'fli',
    scheduledOn: '2027-06-16T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-1'
  },
  {
    id: 'summer-2027-turf-06-30',
    seasonId: 'summer-2027',
    name: 'Summer Season • June 30 at Turf Paradise',
    type: 'fli',
    scheduledOn: '2027-06-30T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-1'
  },
  {
    id: 'summer-2027-az-07-14',
    seasonId: 'summer-2027',
    name: 'Summer Season • July 14 at Arizona Athletic Grounds',
    type: 'fli',
    scheduledOn: '2027-07-14T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-2'
  },
  {
    id: 'summer-2027-az-07-28',
    seasonId: 'summer-2027',
    name: 'Summer Season • July 28 at Arizona Athletic Grounds',
    type: 'fli',
    scheduledOn: '2027-07-28T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-2'
  },
  {
    id: 'summer-championship',
    seasonId: 'summer-2027',
    name: 'Summer Season • August 11 at Arizona Athletic Grounds',
    type: 'fli',
    scheduledOn: '2027-08-11T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-2'
  },
  {
    id: 'canyon-heat-cup',
    seasonId: 'fall-2027',
    name: 'Fall Season • September 16 at Turf Paradise',
    type: 'fli',
    scheduledOn: '2027-09-16T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-1'
  },
  {
    id: 'summer-solstice-invitational',
    seasonId: 'fall-2027',
    name: 'Fall Season • September 30 at Arizona Athletic Grounds',
    type: 'fli',
    scheduledOn: '2027-09-30T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-2'
  },
  {
    id: 'high-desert-classic',
    seasonId: 'fall-2027',
    name: 'Fall Season • October 14 at Turf Paradise',
    type: 'fli',
    scheduledOn: '2027-10-14T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-1'
  },
  {
    id: 'mesa-flight-showdown',
    seasonId: 'fall-2027',
    name: 'Fall Season • October 28 at Arizona Athletic Grounds',
    type: 'fli',
    scheduledOn: '2027-10-28T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-2'
  },
  {
    id: 'fall-2027-turf-11-11',
    seasonId: 'fall-2027',
    name: 'Fall Season • November 11 at Turf Paradise',
    type: 'fli',
    scheduledOn: '2027-11-11T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-1'
  },
  {
    id: 'fall-2027-az-12-09',
    seasonId: 'fall-2027',
    name: 'Fall Season • December 9 at Arizona Athletic Grounds',
    type: 'fli',
    scheduledOn: '2027-12-09T22:00:00.000Z',
    scoringHoleCount: 18,
    status: 'scheduled',
    courseId: 'course-2'
  }
] satisfies readonly TournamentDto[];

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
  '/league/tournaments': defaultTournamentSeedForDemo,
  '/league/seasons': defaultSeasonSeed satisfies readonly SeasonDto[],
  '/sponsorship/tiers': defaultSponsorshipTierSeed satisfies readonly SponsorshipTierDto[],
  '/sponsorship/sponsors': defaultSponsorSeed satisfies readonly SponsorDto[],
  '/sponsorship/deals': defaultSponsorshipDealSeed satisfies readonly SponsorshipDealDto[],
  '/ticketing/types': defaultTicketTypeSeed satisfies readonly TicketTypeDto[],
  '/ticketing/purchases': defaultTicketPurchaseSeed satisfies readonly TicketPurchaseDto[],
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
  if (path === '/league/seasons') {
    return getPersistedDemoCollection<SeasonDto>(
      demoSeasonsStorageKey,
      defaultSeasonSeed
    );
  }
  if (path === '/sponsorship/tiers') {
    return getPersistedDemoCollection<SponsorshipTierDto>(
      demoSponsorshipTiersStorageKey,
      defaultSponsorshipTierSeed
    );
  }
  if (path === '/sponsorship/sponsors') {
    return getPersistedDemoCollection<SponsorDto>(
      demoSponsorsStorageKey,
      defaultSponsorSeed
    );
  }
  if (path === '/sponsorship/deals') {
    return getPersistedDemoCollection<SponsorshipDealDto>(
      demoSponsorshipDealsStorageKey,
      defaultSponsorshipDealSeed
    );
  }
  if (path === '/ticketing/types') {
    return getPersistedDemoCollection<TicketTypeDto>(
      demoTicketTypesStorageKey,
      defaultTicketTypeSeed
    );
  }
  if (path === '/ticketing/purchases') {
    return getPersistedDemoCollection<TicketPurchaseDto>(
      demoTicketPurchasesStorageKey,
      defaultTicketPurchaseSeed
    );
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
  const persistedDemoCollection = [
    '/league/seasons',
    '/sponsorship/tiers',
    '/sponsorship/sponsors',
    '/sponsorship/deals',
    '/ticketing/types',
    '/ticketing/purchases'
  ].includes(path)
    ? getPersistedDemoCollection(
        path === '/league/seasons'
          ? demoSeasonsStorageKey
          : path === '/sponsorship/tiers'
            ? demoSponsorshipTiersStorageKey
            : path === '/sponsorship/sponsors'
              ? demoSponsorsStorageKey
              : path === '/sponsorship/deals'
                ? demoSponsorshipDealsStorageKey
                : path === '/ticketing/types'
                  ? demoTicketTypesStorageKey
                  : demoTicketPurchasesStorageKey,
        path === '/league/seasons'
          ? defaultSeasonSeed
          : path === '/sponsorship/tiers'
            ? defaultSponsorshipTierSeed
            : path === '/sponsorship/sponsors'
              ? defaultSponsorSeed
              : path === '/sponsorship/deals'
                ? defaultSponsorshipDealSeed
                : path === '/ticketing/types'
                  ? defaultTicketTypeSeed
                  : defaultTicketPurchaseSeed
      )
    : undefined;

  if (persistedDemoCollection !== undefined) {
    return persistedDemoCollection as Value;
  }

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
export const fetchSponsors = () =>
  getJson<readonly SponsorDto[]>('/sponsorship/sponsors');
export const fetchSponsorshipTiers = () =>
  getJson<readonly SponsorshipTierDto[]>('/sponsorship/tiers');
export const fetchSponsorshipDeals = () =>
  getJson<readonly SponsorshipDealDto[]>('/sponsorship/deals');
export const fetchTicketTypes = () =>
  getJson<readonly TicketTypeDto[]>('/ticketing/types');
export const fetchTicketPurchases = () =>
  getJson<readonly TicketPurchaseDto[]>('/ticketing/purchases');
export const createTicketType = (input: Omit<TicketTypeDto, 'id' | 'createdAt'> & { readonly id?: string; readonly createdAt?: string }) => postJson<TicketTypeDto>('/ticketing/types', {
  ...input,
  id: input.id ?? `ticket-${Date.now().toString()}`,
  createdAt: input.createdAt ?? new Date().toISOString()
});
export const createTicketPurchase = (input: Omit<TicketPurchaseDto, 'id' | 'createdAt'> & { readonly id?: string; readonly createdAt?: string }) => postJson<TicketPurchaseDto>('/ticketing/purchases', {
  ...input,
  id: input.id ?? `purchase-${Date.now().toString()}`,
  createdAt: input.createdAt ?? new Date().toISOString()
});
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
