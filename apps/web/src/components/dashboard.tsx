import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  ArrowDownUp,
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Map,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  WalletCards,
  X
} from 'lucide-react';
import {
  addCourse,
  addFantasyLeague,
  addFantasyTeam,
  addHole,
  addOrganizationDepartment,
  resetDemoSeasonAndSponsorData,
  resolveTitleSponsorForTarget,
  formatDateOnlyUtc,
  formatDateInputValueUtc,
  addTeam,
  addTournament,
  approveFantasyLeagueMembership,
  assignAllTournamentTeeGroupScorekeepers,
  assignTournamentTeeGroupScorekeeper,
  createFantasyTournament,
  createSeason,
  deleteSeason,
  deleteCourse,
  deleteHoles,
  deleteTournament,
  deleteTournaments,
  createDraft,
  requestFantasyLeagueMembership,
  fetchCourses,
  fetchDepartments,
  fetchDrafts,
  fetchFantasyLeagues,
  fetchFantasyMemberships,
  fetchFantasyTeams,
  fetchFantasyTournaments,
  fetchHoles,
  fetchOrganizationUsers,
  fetchPlayers,
  fetchProjects,
  fetchReimbursementClaims,
  fetchSeasons,
  fetchSponsors,
  fetchSponsorshipDeals,
  fetchSponsorshipTiers,
  fetchTicketPurchases,
  fetchTicketTypes,
  fetchTeams,
  fetchTournamentRegistrations,
  fetchTournamentTeeGroupScorecard,
  fetchTournamentTeeGroups,
  clearTournamentTeeGroups,
  fetchTournaments,
  makeDraftPick,
  openDraft,
  seedFantasy,
  seedFantasyLeague,
  seedSixTournaments,
  seedTournamentTeeGroups,
  seedTournamentGroupsAndAssignAllScorekeepers,
  seedAllTournamentGroupsAndAssignAllScorekeepers,
  saveTournamentTeeGroupHoleScores,
  seedAllTournamentTeeGroups,
  updateTournament,
  updateCourse,
  updateSeason,
  type CourseDto,
  type DepartmentDto,
  type DraftRoomDto,
  type FantasyLeagueDto,
  type FantasyMembershipDto,
  type FantasyTeamDto,
  type FantasyTournamentDto,
  type HoleDto,
  type PlayerDto,
  type ProjectDto,
  type ReimbursementClaimDto,
  type SeasonDto,
  type SponsorDto,
  type SponsorshipDealDto,
  type SponsorshipTierDto,
  type TeamDto,
  type TicketPurchaseDto,
  type TicketTypeDto,
  type TournamentDto,
  type TournamentTeeGroupDto,
  type TournamentTeeGroupScorecardDto,
  type TournamentRegistrationDto,
  type UserDto
} from '@/lib/api.js';
import { formatRelativeToPar, strokesToRelative } from '@/lib/scoring.js';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { ObjectSelect } from '@/components/object-select.js';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table.js';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs.js';

interface DashboardData {
  readonly players: readonly PlayerDto[];
  readonly seasons: readonly SeasonDto[];
  readonly sponsors: readonly SponsorDto[];
  readonly sponsorshipTiers: readonly SponsorshipTierDto[];
  readonly sponsorshipDeals: readonly SponsorshipDealDto[];
  readonly ticketTypes: readonly TicketTypeDto[];
  readonly ticketPurchases: readonly TicketPurchaseDto[];
  readonly teams: readonly TeamDto[];
  readonly tournaments: readonly TournamentDto[];
  readonly courses: readonly CourseDto[];
  readonly holes: readonly HoleDto[];
  readonly registrations: readonly TournamentRegistrationDto[];
  readonly departments: readonly DepartmentDto[];
  readonly projects: readonly ProjectDto[];
  readonly claims: readonly ReimbursementClaimDto[];
  readonly fantasyLeagues: readonly FantasyLeagueDto[];
  readonly fantasyMemberships: readonly FantasyMembershipDto[];
  readonly fantasyTournaments: readonly FantasyTournamentDto[];
  readonly fantasyTeams: readonly FantasyTeamDto[];
  readonly drafts: readonly DraftRoomDto[];
  readonly users: readonly UserDto[];
}

type PlayerSortKey = 'id' | 'displayName' | 'brand' | 'team' | 'playerType' | 'active';
type TournamentSortKey =
  | 'id'
  | 'name'
  | 'brand'
  | 'seasonId'
  | 'scheduledOn'
  | 'courseId'
  | 'type';

const sectionIcons = {
  seasons: CalendarRange,
  players: Users,
  teams: ShieldCheck,
  tournaments: Trophy,
  groups: ClipboardCheck,
  scoring: Sparkles,
  courses: Map,
  holes: FileText,
  registrations: BriefcaseBusiness,
  sponsors: BadgeDollarSign,
  tickets: WalletCards,
  fantasy: Sparkles,
  drafts: FolderKanban,
  departments: BriefcaseBusiness,
  projects: FolderKanban,
  claims: WalletCards
} as const;

const dashboardSections = [
  { value: 'seasons', label: 'Seasons', group: 'League' },
  { value: 'players', label: 'Players', group: 'League' },
  { value: 'teams', label: 'Teams', group: 'League' },
  { value: 'tournaments', label: 'Tournaments', group: 'League' },
  { value: 'groups', label: 'Groups', group: 'League' },
  { value: 'scoring', label: 'Scoring', group: 'League' },
  { value: 'courses', label: 'Courses', group: 'League' },
  { value: 'holes', label: 'Holes', group: 'League' },
  { value: 'registrations', label: 'Registrations', group: 'League' },
  { value: 'sponsors', label: 'Sponsors', group: 'Business' },
  { value: 'tickets', label: 'Tickets', group: 'Business' },
  { value: 'fantasy', label: 'Fantasy', group: 'Fantasy' },
  { value: 'drafts', label: 'Drafts', group: 'Fantasy' },
  { value: 'departments', label: 'Departments', group: 'Workspace' },
  { value: 'projects', label: 'Projects', group: 'Workspace' },
  { value: 'claims', label: 'Claims', group: 'Workspace' }
] as const;

const dashboardSectionGroups = [
  { label: 'League', items: dashboardSections.filter((section) => section.group === 'League') },
  { label: 'Business', items: dashboardSections.filter((section) => section.group === 'Business') },
  { label: 'Fantasy', items: dashboardSections.filter((section) => section.group === 'Fantasy') },
  { label: 'Workspace', items: dashboardSections.filter((section) => section.group === 'Workspace') }
] as const;

const groupHeaderStyles = {
  League: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200',
  Business: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-200',
  Fantasy: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-200',
  Workspace: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200'
} as const;

const groupLinkStyles = {
  League: {
    default: 'border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100/80 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200 dark:hover:bg-emerald-900/30',
    selected: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100'
  },
  Business: {
    default: 'border-cyan-200 bg-cyan-50/70 text-cyan-700 hover:bg-cyan-100/80 dark:border-cyan-800 dark:bg-cyan-950/20 dark:text-cyan-200 dark:hover:bg-cyan-900/30',
    selected: 'border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-100'
  },
  Fantasy: {
    default: 'border-pink-200 bg-pink-50/70 text-pink-700 hover:bg-pink-100/80 dark:border-pink-800 dark:bg-pink-950/20 dark:text-pink-200 dark:hover:bg-pink-900/30',
    selected: 'border-pink-300 bg-pink-100 text-pink-800 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-100'
  },
  Workspace: {
    default: 'border-violet-200 bg-violet-50/70 text-violet-700 hover:bg-violet-100/80 dark:border-violet-800 dark:bg-violet-950/20 dark:text-violet-200 dark:hover:bg-violet-900/30',
    selected: 'border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-100'
  }
} as const;

type DashboardSection = (typeof dashboardSections)[number]['value'];

const getPlayerTeamName = (
  playerId: string,
  teams: readonly TeamDto[]
): string =>
  teams.find(
    (team) => team.malePlayerId === playerId || team.femalePlayerId === playerId
  )?.name ?? '';

const getCourseNameById = (
  courseId: string,
  courses: readonly CourseDto[]
): string => courses.find((course) => course.id === courseId)?.name ?? courseId;

const getHoleDisplayName = (
  hole: HoleDto,
  courses: readonly CourseDto[]
): string => `${getCourseNameById(hole.courseId, courses)} • Hole ${hole.number}`;

const getSeasonNameById = (
  seasonId: string,
  seasons: readonly SeasonDto[]
): string => seasons.find((season) => season.id === seasonId)?.name ?? seasonId;

const getTournamentNameById = (
  tournamentId: string,
  tournaments: readonly TournamentDto[]
): string => tournaments.find((tournament) => tournament.id === tournamentId)?.name ?? tournamentId;

const getSponsorTierNameById = (
  tierId: string,
  tiers: readonly SponsorshipTierDto[]
): string => tiers.find((tier) => tier.id === tierId)?.name ?? tierId;

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);

function SponsorLogo({ sponsor }: { readonly sponsor: SponsorDto }) {
  const initials = sponsor.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'SP';

  const [imageFailed, setImageFailed] = useState(false);

  if (!sponsor.logoUrl || imageFailed) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-foreground">
        {initials}
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
      <img
        src={sponsor.logoUrl}
        alt={`${sponsor.name} logo`}
        className="h-full w-full object-cover"
        onError={() => {
          setImageFailed(true);
        }}
      />
    </div>
  );
}

function AddDepartmentForm({
  onAdded
}: {
  readonly onAdded?: () => void;
}) {
  const [name, setName] = useState('');
  const [headName, setHeadName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const organizationId =
      window.localStorage.getItem('flihub-active-organization') ?? 'fgl';

    try {
      addOrganizationDepartment(organizationId, { name, headName });
      setName('');
      setHeadName('');
      setError(undefined);
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add department.'
      );
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-department-name">New department</Label>
        <Input
          id="new-department-name"
          placeholder="e.g. Course Operations"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-department-head">Head (optional)</Label>
        <Input
          id="new-department-head"
          placeholder="e.g. Alex Rivera"
          value={headName}
          onChange={(event) => {
            setHeadName(event.target.value);
          }}
        />
      </div>
      <Button type="submit" disabled={name.trim().length < 2}>
        Add department
      </Button>
      {error !== undefined && (
        <p className="text-sm text-destructive sm:basis-full">{error}</p>
      )}
    </form>
  );
}

function EditSeasonModal({
  season,
  sponsors,
  deals,
  onClose,
  onSaved
}: {
  readonly season: SeasonDto;
  readonly sponsors: readonly SponsorDto[];
  readonly deals: readonly SponsorshipDealDto[];
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState(season.name);
  const [brand, setBrand] = useState(season.brand ?? season.name);
  const [startsOn, setStartsOn] = useState(formatDateInputValueUtc(season.startsOn));
  const [endsOn, setEndsOn] = useState(formatDateInputValueUtc(season.endsOn));
  const [yearlyPurse, setYearlyPurse] = useState(
    (season.yearlyPurseMinorUnits / 100).toString()
  );
  const [status, setStatus] = useState(season.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const titleSponsor = resolveTitleSponsorForTarget({
    targetType: 'season',
    targetId: season.id,
    sponsors,
    deals
  });

  const save = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await updateSeason(season.id, {
        name,
        brand: brand.trim() || name,
        startsOn: new Date(`${startsOn}T00:00:00.000Z`).toISOString(),
        endsOn: new Date(`${endsOn}T23:59:59.999Z`).toISOString(),
        yearlyPurseMinorUnits: Math.round((Number(yearlyPurse) || 0) * 100),
        yearlyPurseCurrency: season.yearlyPurseCurrency,
        status
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update season.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="w-full max-w-lg rounded-lg border bg-card p-6 text-card-foreground shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-season-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Season settings
            </p>
            <h2 id="edit-season-title" className="mt-1 text-xl font-semibold">
              Edit {season.name}
            </h2>
          </div>
          <Button variant="ghost" size="icon-sm" type="button" aria-label="Close edit season" onClick={onClose}>
            <X />
          </Button>
        </div>
        <form onSubmit={(event) => { void save(event); }} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-season-name">Name</Label>
            <Input id="edit-season-name" value={name} onChange={(event) => { setName(event.target.value); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-season-brand">Brand</Label>
            <Input id="edit-season-brand" value={brand} onChange={(event) => { setBrand(event.target.value); }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-season-start">Starts</Label>
              <Input id="edit-season-start" type="date" value={startsOn} onChange={(event) => { setStartsOn(event.target.value); }} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-season-end">Ends</Label>
              <Input id="edit-season-end" type="date" value={endsOn} onChange={(event) => { setEndsOn(event.target.value); }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-season-purse">Yearly purse ({season.yearlyPurseCurrency})</Label>
            <Input id="edit-season-purse" type="number" min={0} step="1" value={yearlyPurse} onChange={(event) => { setYearlyPurse(event.target.value); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Title sponsor</Label>
            <div className="flex min-h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
              {titleSponsor.status === 'not-assigned' ? (
                <span className="text-muted-foreground">Not assigned</span>
              ) : titleSponsor.status === 'conflict' ? (
                <span className="font-medium text-amber-600 dark:text-amber-400">Title sponsor conflict</span>
              ) : titleSponsor.sponsor ? (
                <>
                  {titleSponsor.sponsor.logoUrl && (
                    <img
                      src={titleSponsor.sponsor.logoUrl}
                      alt={titleSponsor.sponsor.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{titleSponsor.sponsor.brandName ?? titleSponsor.sponsor.name}</span>
                  {titleSponsor.status === 'prospective' && (
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
                      Prospective
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Not assigned</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-season-status">Status</Label>
            <ObjectSelect
              id="edit-season-status"
              value={status}
              onValueChange={(value) => {
                setStatus(value as SeasonDto['status']);
              }}
              options={[
                { id: 'current', label: 'Current' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' }
              ]}
              placeholder="Select status"
            />
          </div>
          {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={name.trim().length < 2 || startsOn === '' || endsOn === '' || saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function NewSeasonModal({
  leagueId,
  onClose,
  onSaved
}: {
  readonly leagueId: string;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [yearlyPurse, setYearlyPurse] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const save = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await createSeason({
        leagueId,
        name,
        brand: brand.trim() || name,
        startsOn: new Date(`${startsOn}T00:00:00.000Z`).toISOString(),
        endsOn: new Date(`${endsOn}T23:59:59.999Z`).toISOString(),
        yearlyPurseMinorUnits: Math.round((Number(yearlyPurse) || 0) * 100),
        yearlyPurseCurrency: 'USD',
        status: 'upcoming'
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create season.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="w-full max-w-lg rounded-lg border bg-card p-6 text-card-foreground shadow-xl" role="dialog" aria-modal="true" aria-labelledby="new-season-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Season settings</p>
            <h2 id="new-season-title" className="mt-1 text-xl font-semibold">New season</h2>
          </div>
          <Button variant="ghost" size="icon-sm" type="button" aria-label="Close new season" onClick={onClose}><X /></Button>
        </div>
        <form onSubmit={(event) => { void save(event); }} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-season-name">Name</Label>
            <Input id="new-season-name" placeholder="e.g. Fall Season" value={name} onChange={(event) => { setName(event.target.value); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-season-brand">Brand</Label>
            <Input id="new-season-brand" placeholder="e.g. FLI Golf League" value={brand} onChange={(event) => { setBrand(event.target.value); }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-season-start">Starts</Label>
              <Input id="new-season-start" type="date" value={startsOn} onChange={(event) => { setStartsOn(event.target.value); }} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-season-end">Ends</Label>
              <Input id="new-season-end" type="date" value={endsOn} onChange={(event) => { setEndsOn(event.target.value); }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-season-purse">Yearly purse (USD)</Label>
            <Input id="new-season-purse" type="number" min={0} step="1" value={yearlyPurse} onChange={(event) => { setYearlyPurse(event.target.value); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Title sponsor</Label>
            <div className="flex min-h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Not assigned
            </div>
            <p className="text-xs text-muted-foreground">Use Reset demo data to restore default season sponsor assignments.</p>
          </div>
          {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={name.trim().length < 2 || startsOn === '' || endsOn === '' || saving}>{saving ? 'Creating...' : 'Create season'}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AddTournamentForm({
  courses,
  seasons,
  onAdded
}: {
  readonly courses: readonly CourseDto[];
  readonly seasons: readonly SeasonDto[];
  readonly onAdded?: () => void;
}) {
  const [name, setName] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState<'fli' | 'multi-round'>('fli');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (seasonId === '' || courseId === '') {
      setError('Select a season and course first.');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await addTournament({
        name,
        seasonId,
        courseId,
        type
      });
      setName('');
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add tournament.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const seedSix = async () => {
    if (seasonId === '' || courseId === '') {
      setError('Select a season and course first.');
      return;
    }
    setSeeding(true);
    setError(undefined);
    try {
      await seedSixTournaments({ seasonId, courseId, type });
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not seed tournaments.'
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-tournament-name">New tournament</Label>
        <Input
          id="new-tournament-name"
          placeholder="e.g. Autumn Invitational"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-tournament-type">Type</Label>
        <ObjectSelect
          id="new-tournament-type"
          value={type}
          onValueChange={(value) => {
            setType(value as 'fli' | 'multi-round');
          }}
          options={[
            { id: 'fli', label: 'FLI (9 holes played twice)' },
            { id: 'multi-round', label: 'Multi Round (full course)' }
          ]}
          placeholder="Select type"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-tournament-course">Course</Label>
          <ObjectSelect
            id="new-tournament-course"
            value={courseId}
            onValueChange={setCourseId}
            options={courses.map((course) => ({ id: course.id, label: course.name }))}
            placeholder="Select course"
          />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-tournament-season">Season</Label>
        <ObjectSelect
          id="new-tournament-season"
          value={seasonId}
          onValueChange={setSeasonId}
          options={seasons.map((season) => ({
            id: season.id,
            label: season.name
          }))}
          placeholder="Select season"
        />
      </div>
      <Button
        type="submit"
        disabled={
          name.trim().length < 2 ||
          seasonId === '' ||
          courseId === '' ||
          submitting ||
          seeding
        }
      >
        {submitting ? 'Adding…' : 'Add tournament'}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={seasonId === '' || courseId === '' || submitting || seeding}
        onClick={() => {
          void seedSix();
        }}
      >
        {seeding ? 'Seeding 12...' : 'Seed 12'}
      </Button>
      {error !== undefined && (
        <p className="text-sm text-destructive sm:basis-full">{error}</p>
      )}
    </form>
  );
}

function EditTournamentModal({
  tournament,
  seasons,
  courses,
  onClose,
  onSaved
}: {
  readonly tournament: TournamentDto;
  readonly seasons: readonly SeasonDto[];
  readonly courses: readonly CourseDto[];
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState(tournament.name);
  const [seasonId, setSeasonId] = useState(tournament.seasonId);
  const [courseId, setCourseId] = useState(tournament.courseId ?? '');
  const [type, setType] = useState(tournament.type);
  const [scheduledOn, setScheduledOn] = useState(
    tournament.scheduledOn?.slice(0, 10) ?? ''
  );
  const [status, setStatus] = useState(tournament.status ?? 'scheduled');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const save = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await updateTournament(tournament.id, {
        name,
        seasonId,
        courseId,
        type,
        scheduledOn:
          scheduledOn === ''
            ? undefined
            : new Date(`${scheduledOn}T22:00:00.000Z`).toISOString(),
        status
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update tournament.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="w-full max-w-lg rounded-lg border bg-card p-6 text-card-foreground shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-tournament-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tournament settings</p>
            <h2 id="edit-tournament-title" className="mt-1 text-xl font-semibold">Edit {tournament.name}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" type="button" aria-label="Close edit tournament" onClick={onClose}><X /></Button>
        </div>
        <form onSubmit={(event) => { void save(event); }} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-tournament-name">Name</Label>
            <Input id="edit-tournament-name" value={name} onChange={(event) => { setName(event.target.value); }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tournament-season">Season</Label>
              <ObjectSelect id="edit-tournament-season" value={seasonId} onValueChange={setSeasonId} options={seasons.map((season) => ({ id: season.id, label: season.name }))} placeholder="Select season" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tournament-course">Course</Label>
              <ObjectSelect id="edit-tournament-course" value={courseId} onValueChange={setCourseId} options={courses.map((course) => ({ id: course.id, label: course.name }))} placeholder="Select course" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tournament-type">Type</Label>
              <ObjectSelect id="edit-tournament-type" value={type} onValueChange={(value) => { setType(value as TournamentDto['type']); }} options={[{ id: 'fli', label: 'FLI (9 holes played twice)' }, { id: 'multi-round', label: 'Multi Round (full course)' }]} placeholder="Select type" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tournament-status">Status</Label>
              <ObjectSelect id="edit-tournament-status" value={status} onValueChange={(value) => { setStatus(value as NonNullable<TournamentDto['status']>); }} options={[{ id: 'scheduled', label: 'Scheduled' }, { id: 'in_progress', label: 'In progress' }, { id: 'completed', label: 'Completed' }, { id: 'cancelled', label: 'Cancelled' }]} placeholder="Select status" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-tournament-date">Date</Label>
            <Input id="edit-tournament-date" type="date" value={scheduledOn} onChange={(event) => { setScheduledOn(event.target.value); }} />
          </div>
          {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={name.trim().length < 2 || seasonId === '' || courseId === '' || saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TournamentSetup({
  tournaments,
  courses,
  users
}: {
  readonly tournaments: readonly TournamentDto[];
  readonly courses: readonly CourseDto[];
  readonly users: readonly UserDto[];
}) {
  const [tournamentId, setTournamentId] = useState('');
  const [groups, setGroups] = useState<readonly TournamentTeeGroupDto[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedingAll, setSeedingAll] = useState(false);
  const [seedAndAssigningAll, setSeedAndAssigningAll] = useState(false);
  const [assigningAllScorekeepers, setAssigningAllScorekeepers] = useState(false);
  const [assigningGroupId, setAssigningGroupId] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (tournamentId === '') {
      setGroups([]);
      return;
    }
    void fetchTournamentTeeGroups(tournamentId).then(setGroups);
  }, [tournamentId]);

  const tournament = tournaments.find((entry) => entry.id === tournamentId);
  const course = courses.find((entry) => entry.id === tournament?.courseId);

  const seedGroups = async () => {
    if (tournamentId === '') return;
    setSeeding(true);
    setError(undefined);
    try {
      await seedTournamentTeeGroups(tournamentId);
      setGroups(await fetchTournamentTeeGroups(tournamentId));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not seed tee groups.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const clearGroups = async () => {
    if (tournamentId === '') return;
    setSeeding(true);
    setError(undefined);
    try {
      await clearTournamentTeeGroups(tournamentId);
      setGroups([]);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not clear tee groups.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const seedAllGroups = async () => {
    setSeedingAll(true);
    setError(undefined);
    try {
      await seedAllTournamentTeeGroups();
      if (tournamentId !== '') {
        setGroups(await fetchTournamentTeeGroups(tournamentId));
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not seed all groups.'
      );
    } finally {
      setSeedingAll(false);
    }
  };

  const assignScorekeeper = async (
    groupId: string,
    scorekeeperId: string | undefined
  ) => {
    if (tournamentId === '') return;
    setAssigningGroupId(groupId);
    setError(undefined);
    try {
      await assignTournamentTeeGroupScorekeeper(
        tournamentId,
        groupId,
        scorekeeperId
      );
      setGroups(await fetchTournamentTeeGroups(tournamentId));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not assign scorekeeper.'
      );
    } finally {
      setAssigningGroupId(undefined);
    }
  };

  const scorekeepers = users.filter((user) => user.canScorekeep === true);

  const assignAllScorekeepers = async () => {
    if (tournamentId === '') return;
    setAssigningAllScorekeepers(true);
    setError(undefined);
    try {
      await assignAllTournamentTeeGroupScorekeepers(tournamentId);
      setGroups(await fetchTournamentTeeGroups(tournamentId));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not assign scorekeepers.'
      );
    } finally {
      setAssigningAllScorekeepers(false);
    }
  };

  const seedSelectedTournamentGroupsAndSetAllScorekeepers = async () => {
    if (tournamentId === '') return;
    setSeedAndAssigningAll(true);
    setError(undefined);
    try {
      setGroups(
        await seedTournamentGroupsAndAssignAllScorekeepers(tournamentId)
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not seed selected tournament groups and assign scorekeepers.'
      );
    } finally {
      setSeedAndAssigningAll(false);
    }
  };

  const seedAllTournamentsGroupsAndSetAllScorekeepers = async () => {
    setSeedAndAssigningAll(true);
    setError(undefined);
    try {
      await seedAllTournamentGroupsAndAssignAllScorekeepers();
      setGroups([]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not seed all tournament groups and assign scorekeepers.'
      );
    } finally {
      setSeedAndAssigningAll(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-2 sm:max-w-sm">
        <Label htmlFor="tournament-setup">Tournament setup</Label>
        <ObjectSelect
          id="tournament-setup"
          value={tournamentId}
          onValueChange={setTournamentId}
          options={tournaments.map((entry) => ({
            id: entry.id,
            label: entry.name
          }))}
          placeholder="Select tournament"
        />
        <Button
          type="button"
          variant="outline"
          disabled={tournamentId === '' || seeding}
          onClick={() => {
            void seedGroups();
          }}
        >
          {seeding ? 'Seeding groups...' : 'Seed tee groups'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={tournamentId === '' || seeding}
          onClick={() => {
            void clearGroups();
          }}
        >
          Clear groups
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={seedingAll || seeding}
          onClick={() => {
            void seedAllGroups();
          }}
        >
          {seedingAll ? 'Seeding all...' : 'Seed all groups'}
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={
            tournamentId === '' ||
            seeding ||
            seedingAll ||
            seedAndAssigningAll ||
            assigningAllScorekeepers ||
            scorekeepers.length < 6
          }
          onClick={() => {
            void seedSelectedTournamentGroupsAndSetAllScorekeepers();
          }}
        >
          {seedAndAssigningAll
            ? 'Seeding selected...'
            : 'Seed selected tournament + scorekeepers'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={
            seeding ||
            seedingAll ||
            seedAndAssigningAll ||
            assigningAllScorekeepers ||
            scorekeepers.length < 6
          }
          onClick={() => {
            void seedAllTournamentsGroupsAndSetAllScorekeepers();
          }}
        >
          {seedAndAssigningAll
            ? 'Seeding all tournaments...'
            : 'Seed all tournaments + scorekeepers'}
        </Button>
      </div>
      {tournament !== undefined && groups.length > 0 && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-medium">{tournament.name}</h3>
            <p className="text-sm text-muted-foreground">
              First tee {groups[0].teeTime}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tournament.scheduledOn === undefined
              ? 'Season event'
              : new Date(tournament.scheduledOn).toLocaleDateString()}
          </p>
          {course !== undefined && (
            <p className="mt-1 text-sm text-muted-foreground">
              Course: {course.name}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            disabled={
              scorekeepers.length < 6 ||
              assigningAllScorekeepers ||
              assigningGroupId !== undefined
            }
            onClick={() => {
              void assignAllScorekeepers();
            }}
          >
            {assigningAllScorekeepers
              ? 'Assigning scorekeepers...'
              : 'Set all scorekeepers'}
          </Button>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div key={group.id} className="border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Group {group.number}</p>
                  <Badge variant="outline">{group.teeTime}</Badge>
                </div>
                <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                  {group.teamNames.map((teamName) => (
                    <li key={teamName}>{teamName}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-2">
                  <Label htmlFor={`scorekeeper-${group.id}`}>
                    Scorekeeper
                  </Label>
                  <ObjectSelect
                    id={`scorekeeper-${group.id}`}
                    value={group.scorekeeperId ?? ''}
                    onValueChange={(scorekeeperId) => {
                      void assignScorekeeper(group.id, scorekeeperId);
                    }}
                    options={scorekeepers.map((user) => ({
                      id: user.id,
                      label: user.name
                    }))}
                    placeholder={
                      assigningGroupId === group.id
                        ? 'Assigning...'
                        : 'Assign scorekeeper'
                    }
                    disabled={
                      assigningGroupId !== undefined || assigningAllScorekeepers
                    }
                  />
                  {group.scorekeeperName !== undefined && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={
                        assigningGroupId !== undefined || assigningAllScorekeepers
                      }
                      onClick={() => {
                        void assignScorekeeper(group.id, undefined);
                      }}
                    >
                      Clear scorekeeper
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tournament !== undefined && groups.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No tee groups have been assigned to this tournament.
        </p>
      )}
      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}

function ScorekeeperWorklist({
  user,
  tournaments,
  courses
}: {
  readonly user: UserDto | undefined;
  readonly tournaments: readonly TournamentDto[];
  readonly courses: readonly CourseDto[];
}) {
  const [groups, setGroups] = useState<
    readonly (TournamentTeeGroupDto & { readonly tournament: TournamentDto })[]
  >([]);
  const [selectedGroup, setSelectedGroup] = useState<
    (TournamentTeeGroupDto & { readonly tournament: TournamentDto }) | undefined
  >(undefined);
  const [scorecard, setScorecard] = useState<
    TournamentTeeGroupScorecardDto | undefined
  >(undefined);
  const [holeIndex, setHoleIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user?.canScorekeep !== true) {
      setGroups([]);
      return;
    }

    let cancelled = false;
    void Promise.all(
      tournaments.map(async (tournament) =>
        (await fetchTournamentTeeGroups(tournament.id)).map((group) => ({
          ...group,
          tournament
        }))
      )
    ).then((groupSets) => {
      if (!cancelled) {
        setGroups(
          groupSets
            .flat()
            .filter((group) => group.scorekeeperId === user.id)
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [tournaments, user]);

  useEffect(() => {
    if (selectedGroup === undefined) {
      setScorecard(undefined);
      return;
    }
    let cancelled = false;
    void fetchTournamentTeeGroupScorecard(
      selectedGroup.tournament.id,
      selectedGroup.id
    ).then((nextScorecard) => {
      if (!cancelled) {
        setScorecard(nextScorecard);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedGroup]);

  useEffect(() => {
    if (scorecard === undefined) return;
    const currentHoleNumber = scorecard.holes[holeIndex]?.number;
    const currentPar = scorecard.holes[holeIndex]?.par ?? 3;
    setScores(
      Object.fromEntries(
        scorecard.players.map((player) => [
          player.id,
          String(
            scorecard.scores.find(
              (score) =>
                score.holeNumber === currentHoleNumber &&
                score.playerId === player.id
            )?.strokes ?? currentPar
          )
        ])
      )
    );
  }, [holeIndex, scorecard]);

  if (user?.canScorekeep !== true) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a scorekeeper from Viewing as to access assigned groups.
      </p>
    );
  }

  const currentHole = scorecard?.holes[holeIndex];
  const completedHoles = new Set(
    scorecard?.scores.map((score) => score.holeNumber) ?? []
  ).size;
  const totalRelativeToPar = (playerId: string) =>
    (scorecard?.scores ?? []).reduce((total, score) => {
      if (score.playerId !== playerId) return total;
      const par = scorecard?.holes.find(
        (hole) => hole.number === score.holeNumber
      )?.par;
      return total + (par === undefined ? 0 : score.strokes - par);
    }, 0);

  const getPlayerRelativeValue = (playerId: string): number => {
    if (scorecard === undefined || currentHole === undefined) return 0;
    const rawValue = scores[playerId];
    if (rawValue === undefined || rawValue === '') {
      return 0;
    }
    const strokes = Number(rawValue);
    if (!Number.isFinite(strokes) || strokes < 1) {
      return 0;
    }
    return strokesToRelative(strokes, currentHole.par);
  };

  const getRelativeBadgeClasses = (value: number): string => {
    if (value === 0) {
      return 'border-blue-400 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    }
    if (value > 0) {
      const intensity = Math.min(value, 6);
      return `border-red-400 bg-red-${500 - (intensity - 1) * 50}/10 text-red-700 dark:text-red-300`;
    }
    const intensity = Math.min(Math.abs(value), 6);
    return `border-emerald-400 bg-emerald-${500 - (intensity - 1) * 50}/10 text-emerald-700 dark:text-emerald-300`;
  };

  const updatePlayerScore = (playerId: string, delta: number) => {
    if (scorecard === undefined || currentHole === undefined) return;
    const currentValue = Number(scores[playerId] ?? currentHole.par);
    const nextValue = Math.max(1, currentValue + delta);
    setScores((current) => ({ ...current, [playerId]: String(nextValue) }));
  };

  const saveHole = async (advance: boolean) => {
    if (selectedGroup === undefined || scorecard === undefined || currentHole === undefined) return;
    const playerScores = Object.fromEntries(
      scorecard.players.map((player) => [player.id, Number(scores[player.id] ?? currentHole.par)])
    );
    if (Object.values(playerScores).some((score) => !Number.isInteger(score) || score < 1)) {
      setError('Enter a positive whole-number score for every player.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await saveTournamentTeeGroupHoleScores(
        selectedGroup.tournament.id,
        selectedGroup.id,
        currentHole.number,
        playerScores
      );
      const nextScorecard = await fetchTournamentTeeGroupScorecard(
        selectedGroup.tournament.id,
        selectedGroup.id
      );
      setScorecard(nextScorecard);
      if (advance && holeIndex < nextScorecard.holeCount - 1) {
        setHoleIndex((current) => current + 1);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save scores.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-medium">{user.name}&apos;s assigned groups</h3>
        <p className="text-sm text-muted-foreground">
          Score the tee groups assigned to you.
        </p>
      </div>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tee groups are assigned to you yet.
        </p>
      ) : (
        <>
          {selectedGroup === undefined || scorecard === undefined || currentHole === undefined ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.id} className="border bg-background p-3">
                  <p className="font-medium">{group.tournament.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Group {group.number} · {group.teeTime}
                  </p>
                  <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                    {group.teamNames.map((teamName) => <li key={teamName}>{teamName}</li>)}
                  </ul>
                  <Button type="button" className="mt-4" onClick={() => {
                    setSelectedGroup(group);
                    setHoleIndex(0);
                    setError(undefined);
                  }}>
                    Score group
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <section className="border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium">{scorecard.tournamentName} · Group {selectedGroup.number}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hole {currentHole.number}/{scorecard.holeCount} · {currentHole.name} · Par {currentHole.par}
                    {currentHole.distanceFeet === undefined ? '' : ` · ${currentHole.distanceFeet.toString()} ft`}
                  </p>
                </div>
                <Badge variant="outline">{completedHoles.toString()}/{scorecard.holeCount} saved</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900/40">
                <span className="font-medium">Basket:</span>
                <span className="text-muted-foreground">{scorecard.tournamentName}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium">Group {selectedGroup.number}</span>
                <span className="text-muted-foreground">·</span>
                <span className="rounded border border-blue-400 bg-blue-500/10 px-2 py-0.5 text-blue-700 dark:text-blue-300">Par {currentHole.par}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {scorecard.players.map((player) => {
                  const currentValue = Number(scores[player.id] ?? currentHole.par);
                  const relativeValue = getPlayerRelativeValue(player.id);
                  return (
                    <div key={player.id} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`score-${player.id}`}>{player.name} · {player.teamName}</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Decrease score for ${player.name}`}
                            onClick={() => updatePlayerScore(player.id, -1)}
                          >
                            −
                          </Button>
                          <div className="flex-1 rounded-md border bg-background px-3 py-2 text-center text-lg font-semibold">
                            {currentValue}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Increase score for ${player.name}`}
                            onClick={() => updatePlayerScore(player.id, 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline" className={getRelativeBadgeClasses(relativeValue)}>
                        {formatRelativeToPar(relativeValue)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={saving || holeIndex === 0} onClick={() => { setHoleIndex((current) => current - 1); }}>Previous</Button>
                <Button type="button" disabled={saving} onClick={() => { void saveHole(true); }}>
                  {saving ? 'Saving...' : holeIndex === scorecard.holeCount - 1 ? 'Save final hole' : 'Save and next'}
                </Button>
                <Button type="button" variant="ghost" disabled={saving} onClick={() => { setSelectedGroup(undefined); }}>Back to groups</Button>
              </div>
            </section>
          )}
        </>
      )}
      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function AddTeamForm({
  players,
  onAdded
}: {
  readonly players: readonly PlayerDto[];
  readonly onAdded?: () => void;
}) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [malePlayerId, setMalePlayerId] = useState('');
  const [femalePlayerId, setFemalePlayerId] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const malePlayers = players.filter(
    (player) => player.gender === 'male' && player.active
  );
  const femalePlayers = players.filter(
    (player) => player.gender === 'female' && player.active
  );

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (malePlayerId === '' || femalePlayerId === '') {
      setError('Select one male and one female player.');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await addTeam({ name, brand: brand.trim() || name, malePlayerId, femalePlayerId });
      setName('');
      setBrand('');
      setMalePlayerId('');
      setFemalePlayerId('');
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add team.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-team-name">New team</Label>
          <Input
            id="new-team-name"
            placeholder="e.g. Rivera & Blake"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-team-brand">Brand</Label>
          <Input
            id="new-team-brand"
            placeholder="e.g. Ace Makers"
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-team-male">Male player</Label>
          <ObjectSelect
            id="new-team-male"
            value={malePlayerId}
            onValueChange={setMalePlayerId}
            options={malePlayers.map((player) => ({
              id: player.id,
              label: player.displayName
            }))}
            placeholder="Select player"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-team-female">Female player</Label>
          <ObjectSelect
            id="new-team-female"
            value={femalePlayerId}
            onValueChange={setFemalePlayerId}
            options={femalePlayers.map((player) => ({
              id: player.id,
              label: player.displayName
            }))}
            placeholder="Select player"
          />
        </div>
        <Button
          type="submit"
          disabled={
            name.trim().length < 2 ||
            malePlayerId === '' ||
            femalePlayerId === '' ||
            submitting
          }
        >
          {submitting ? 'Adding…' : 'Add team'}
        </Button>
      </div>
      {error !== undefined && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}

function AddCourseForm({ onAdded }: { readonly onAdded?: () => void }) {
  const [name, setName] = useState('');
  const [holeCount, setHoleCount] = useState('18');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      await addCourse({ name, holeCount: Number(holeCount) || 18 });
      setName('');
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add course.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-course-name">New course</Label>
        <Input
          id="new-course-name"
          placeholder="e.g. Maple Ridge"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-course-holes">Holes</Label>
        <Input
          id="new-course-holes"
          type="number"
          min={1}
          className="w-24"
          value={holeCount}
          onChange={(event) => {
            setHoleCount(event.target.value);
          }}
        />
      </div>
      <Button type="submit" disabled={name.trim().length < 2 || submitting}>
        {submitting ? 'Adding…' : 'Add course'}
      </Button>
      {error !== undefined && (
        <p className="text-sm text-destructive sm:basis-full">{error}</p>
      )}
    </form>
  );
}

function EditCourseModal({
  course,
  onClose,
  onSaved
}: {
  readonly course: CourseDto;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState(course.name);
  const [holeCount, setHoleCount] = useState(course.holeCount.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const save = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await updateCourse(course.id, {
        name,
        holeCount: Number(holeCount)
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="w-full max-w-lg rounded-lg border bg-card p-6 text-card-foreground shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-course-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Course settings</p>
            <h2 id="edit-course-title" className="mt-1 text-xl font-semibold">Edit {course.name}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" type="button" aria-label="Close edit course" onClick={onClose}><X /></Button>
        </div>
        <form onSubmit={(event) => { void save(event); }} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-course-name">Name</Label>
            <Input id="edit-course-name" value={name} onChange={(event) => { setName(event.target.value); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-course-holes">Holes</Label>
            <Input id="edit-course-holes" type="number" min={1} value={holeCount} onChange={(event) => { setHoleCount(event.target.value); }} />
          </div>
          {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={name.trim().length < 2 || Number(holeCount) < 1 || saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AddHoleForm({
  courses,
  onAdded
}: {
  readonly courses: readonly CourseDto[];
  readonly onAdded?: () => void;
}) {
  const [courseId, setCourseId] = useState('');
  const [number, setNumber] = useState('1');
  const [par, setPar] = useState('3');
  const [blueBasket, setBlueBasket] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleNumberChange = (value: string) => {
    const nextNumber = Number(value) || 1;
    setNumber(value);
    setBlueBasket(nextNumber <= 9);
  };

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (courseId === '') {
      setError('Select a course first.');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await addHole({
        courseId,
        number: Number(number) || 1,
        par: Number(par) || 3,
        blueBasket
      });
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add hole.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-hole-course">Course</Label>
          <ObjectSelect
            id="new-hole-course"
            value={courseId}
            onValueChange={setCourseId}
            options={courses.map((course) => ({ id: course.id, label: course.name }))}
            placeholder="Select course"
          />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-hole-number">Number</Label>
        <Input
          id="new-hole-number"
          type="number"
          min={1}
          className="w-24"
          value={number}
          onChange={(event) => {
            handleNumberChange(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-hole-par">Par</Label>
        <Input
          id="new-hole-par"
          type="number"
          min={1}
          className="w-20"
          value={par}
          onChange={(event) => {
            setPar(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-hole-blue-basket">Basket</Label>
        <div className="flex items-center gap-2">
          <input
            id="new-hole-blue-basket"
            type="checkbox"
            checked={blueBasket}
            onChange={(event) => {
              setBlueBasket(event.target.checked);
            }}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-muted-foreground">
            {blueBasket ? 'Blue basket (front 9)' : 'Red basket (back 9)'}
          </span>
        </div>
      </div>
      <Button type="submit" disabled={courseId === '' || submitting}>
        {submitting ? 'Adding…' : 'Add hole'}
      </Button>
      {error !== undefined && (
        <p className="text-sm text-destructive sm:basis-full">{error}</p>
      )}
    </form>
  );
}

function FantasySeedControls() {
  const [leagues, setLeagues] = useState('1');
  const [teamsPerLeague, setTeamsPerLeague] = useState('2');
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState<string | undefined>(undefined);

  const runSeed = async () => {
    setSeeding(true);
    setError(undefined);
    setDone(undefined);
    try {
      const result = await seedFantasy({
        leagues: Number(leagues) || 0,
        teamsPerLeague: Number(teamsPerLeague) || 2
      });
      setDone(
        `Seeded ${result.created.leagues.length.toString()} league(s) and ${result.created.teams.length.toString()} team(s).`
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="seed-fantasy-leagues">Leagues</Label>
          <Input
            id="seed-fantasy-leagues"
            type="number"
            min={0}
            className="w-24"
            value={leagues}
            onChange={(event) => {
              setLeagues(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="seed-fantasy-teams">Teams / league</Label>
          <Input
            id="seed-fantasy-teams"
            type="number"
            min={1}
            className="w-24"
            value={teamsPerLeague}
            onChange={(event) => {
              setTeamsPerLeague(event.target.value);
            }}
          />
        </div>
        <Button
          type="button"
          disabled={seeding}
          onClick={() => {
            void runSeed();
          }}
        >
          {seeding ? 'Seeding…' : 'Seed fantasy data'}
        </Button>
      </div>
      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
      {done !== undefined && (
        <p className="text-sm text-emerald-600 dark:text-emerald-300">{done}</p>
      )}
    </div>
  );
}

function AddFantasyLeagueForm({
  players,
  onAdded
}: {
  readonly players: readonly PlayerDto[];
  readonly onAdded?: () => void;
}) {
  const [name, setName] = useState('');
  const [participantIds, setParticipantIds] = useState<readonly string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const toggleParticipant = (playerId: string) => {
    setParticipantIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : current.length < 6
          ? [...current, playerId]
          : current
    );
  };

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      await addFantasyLeague({ name, participantIds });
      setName('');
      setParticipantIds([]);
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add league.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-fantasy-league-name">New fantasy league</Label>
          <Input
            id="new-fantasy-league-name"
            placeholder="e.g. FLI Golf Fantasy"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <Button type="submit" disabled={name.trim().length < 2 || submitting}>
          {submitting ? 'Adding…' : 'Add league'}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Participants (up to 6)</Label>
        <div className="flex flex-wrap gap-2">
          {players.map((player) => {
            const selected = participantIds.includes(player.id);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  toggleParticipant(player.id);
                }}
                className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {player.displayName}
              </button>
            );
          })}
        </div>
      </div>
      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

function AddFantasyTeamForm({
  leagues,
  players,
  onAdded
}: {
  readonly leagues: readonly FantasyLeagueDto[];
  readonly players: readonly PlayerDto[];
  readonly onAdded?: () => void;
}) {
  const [fantasyLeagueId, setFantasyLeagueId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const selectedLeague = leagues.find((league) => league.id === fantasyLeagueId);
  const eligibleOwners = players.filter(
    (player) => selectedLeague?.participantIds.includes(player.id) ?? false
  );

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fantasyLeagueId === '' || ownerId === '') {
      setError('Select a league and an owner.');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await addFantasyTeam({ fantasyLeagueId, ownerId, name });
      setName('');
      setOwnerId('');
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not add team.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-fantasy-team-league">League</Label>
          <ObjectSelect
            id="new-fantasy-team-league"
            value={fantasyLeagueId}
            onValueChange={(value) => {
              setFantasyLeagueId(value);
              setOwnerId('');
            }}
            options={leagues.map((league) => ({
              id: league.id,
              label: league.name
            }))}
            placeholder="Select league"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-fantasy-team-owner">Owner</Label>
          <ObjectSelect
            id="new-fantasy-team-owner"
            value={ownerId}
            onValueChange={setOwnerId}
            options={eligibleOwners.map((player) => ({
              id: player.id,
              label: player.displayName
            }))}
            placeholder="Select owner"
            disabled={fantasyLeagueId === ''}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-fantasy-team-name">Team name</Label>
          <Input
            id="new-fantasy-team-name"
            placeholder="e.g. Rivera's Aces"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <Button
          type="submit"
          disabled={
            name.trim().length < 2 ||
            fantasyLeagueId === '' ||
            ownerId === '' ||
            submitting
          }
        >
          {submitting ? 'Adding…' : 'Add team'}
        </Button>
      </div>
      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

function playerName(players: readonly PlayerDto[], id: string): string {
  return players.find((player) => player.id === id)?.displayName ?? id;
}

function CreateDraftForm({
  leagues,
  players,
  onCreated
}: {
  readonly leagues: readonly FantasyLeagueDto[];
  readonly players: readonly PlayerDto[];
  readonly onCreated?: () => void;
}) {
  const [fantasyLeagueId, setFantasyLeagueId] = useState('');
  const [participantIds, setParticipantIds] = useState<readonly string[]>([]);
  const [poolPlayerIds, setPoolPlayerIds] = useState<readonly string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState('60');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (
    list: readonly string[],
    id: string,
    apply: (next: readonly string[]) => void
  ) => {
    apply(
      list.includes(id)
        ? list.filter((entry) => entry !== id)
        : [...list, id]
    );
  };

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      await createDraft({
        fantasyLeagueId,
        participantIds,
        poolPlayerIds,
        timerSeconds: Number(timerSeconds) || 60
      });
      setParticipantIds([]);
      setPoolPlayerIds([]);
      onCreated?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not create draft.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const draftablePlayers = players.filter(
    (player) => player.active && player.gender !== undefined
  );

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="draft-league">Fantasy league</Label>
          <ObjectSelect
            id="draft-league"
            value={fantasyLeagueId}
            onValueChange={setFantasyLeagueId}
            options={leagues.map((league) => ({
              id: league.id,
              label: league.name
            }))}
            placeholder="Select league"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="draft-timer">Pick timer (s)</Label>
          <Input
            id="draft-timer"
            type="number"
            min={1}
            className="w-24"
            value={timerSeconds}
            onChange={(event) => {
              setTimerSeconds(event.target.value);
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Participants (draft order)</Label>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border bg-background p-2">
            {players.map((player) => {
              const selected = participantIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => {
                    toggle(participantIds, player.id, setParticipantIds);
                  }}
                  className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {player.displayName}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Player pool (equal M/F, divisible by participants)</Label>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border bg-background p-2">
            {draftablePlayers.map((player) => {
              const selected = poolPlayerIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => {
                    toggle(poolPlayerIds, player.id, setPoolPlayerIds);
                  }}
                  className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {player.displayName} ({player.gender === 'male' ? 'M' : 'F'})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={
          fantasyLeagueId === '' ||
          participantIds.length === 0 ||
          poolPlayerIds.length === 0 ||
          submitting
        }
        className="self-start"
      >
        {submitting ? 'Creating…' : 'Create draft'}
      </Button>
      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

function DraftBoardCard({
  draft,
  players,
  onChanged
}: {
  readonly draft: DraftRoomDto;
  readonly players: readonly PlayerDto[];
  readonly onChanged?: () => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const taken = new Set(draft.picks.map((pick) => pick.playerId));
  const onTheClock = draft.onTheClockParticipantId;

  const rosterGenderCount = (gender: 'male' | 'female') =>
    draft.picks.filter((pick) => {
      if (pick.participantId !== onTheClock) return false;
      return draft.pool.find((p) => p.id === pick.playerId)?.gender === gender;
    }).length;

  const available = draft.pool.filter(
    (player) =>
      !taken.has(player.id) &&
      rosterGenderCount(player.gender) < draft.maxPerGender
  );

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      setSelectedPlayerId('');
      onChanged?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Draft action failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{draft.id}</p>
          <p className="text-xs text-muted-foreground">
            Round {draft.currentRound} of {draft.rounds} ·{' '}
            {draft.maxPerGender} per gender
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              draft.status === 'complete'
                ? 'secondary'
                : draft.status === 'in_progress'
                  ? 'default'
                  : 'outline'
            }
          >
            {draft.status.replace('_', ' ')}
          </Badge>
          {draft.status === 'in_progress' && (
            <Badge variant="outline">{draft.secondsRemaining}s</Badge>
          )}
        </div>
      </div>

      {draft.status === 'pending' && (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => {
            void run(() => openDraft(draft.id));
          }}
        >
          Open draft
        </Button>
      )}

      {draft.status === 'in_progress' && onTheClock !== undefined && (
        <div className="flex flex-col gap-3 rounded-md border border-primary/40 bg-primary/5 p-3">
          <p className="text-sm">
            <span className="font-medium">On the clock:</span>{' '}
            {playerName(players, onTheClock)}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor={`pick-${draft.id}`}>Select player</Label>
              <ObjectSelect
                id={`pick-${draft.id}`}
                value={selectedPlayerId}
                onValueChange={setSelectedPlayerId}
                options={available.map((player) => ({
                  id: player.id,
                  label: `${playerName(players, player.id)} (${player.gender === 'male' ? 'M' : 'F'})`
                }))}
                placeholder="Choose player"
              />
            </div>
            <Button
              type="button"
              disabled={selectedPlayerId === '' || busy}
              onClick={() => {
                void run(() =>
                  makeDraftPick(draft.id, {
                    participantId: onTheClock,
                    playerId: selectedPlayerId
                  })
                );
              }}
            >
              Make pick
            </Button>
          </div>
        </div>
      )}

      {draft.picks.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Picks ({draft.picks.length})
          </p>
          <ul className="flex flex-col gap-1">
            {draft.picks.map((pick) => (
              <li
                key={pick.pickNumber}
                className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-sm"
              >
                <span>
                  #{pick.pickNumber} · {playerName(players, pick.playerId)}
                </span>
                <span className="text-muted-foreground">
                  {playerName(players, pick.participantId)} · R{pick.round}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {draft.status === 'complete' && (
        <p className="text-sm text-emerald-600 dark:text-emerald-300">
          Draft complete — rosters are set.
        </p>
      )}

      {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function DraftsBoard({
  drafts,
  leagues,
  players,
  onChanged
}: {
  readonly drafts: readonly DraftRoomDto[];
  readonly leagues: readonly FantasyLeagueDto[];
  readonly players: readonly PlayerDto[];
  readonly onChanged?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <CreateDraftForm leagues={leagues} players={players} onCreated={onChanged} />
      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No drafts yet. Create one above to start a live snake draft.
        </p>
      ) : (
        drafts.map((draft) => (
          <DraftBoardCard
            key={draft.id}
            draft={draft}
            players={players}
            onChanged={onChanged}
          />
        ))
      )}
    </div>
  );
}

export function Dashboard({
  refreshKey,
  onDepartmentsChanged,
  currentUser
}: {
  readonly refreshKey: number;
  readonly onDepartmentsChanged?: () => void;
  readonly currentUser?: UserDto;
}) {
  const [data, setData] = useState<DashboardData | undefined>(undefined);
  const [fantasyLeagueId, setFantasyLeagueId] = useState('');
  const [fantasyMemberUserId, setFantasyMemberUserId] = useState('');
  const [fantasyTournamentName, setFantasyTournamentName] = useState('');
  const [fantasySeedName, setFantasySeedName] = useState('');
  const [fantasyActionError, setFantasyActionError] = useState<string | undefined>(undefined);
  const [fantasyBusy, setFantasyBusy] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonDto | undefined>(undefined);
  const [editingTournament, setEditingTournament] = useState<TournamentDto | undefined>(undefined);
  const [editingCourse, setEditingCourse] = useState<CourseDto | undefined>(undefined);
  const [selectedTournamentIds, setSelectedTournamentIds] = useState<readonly string[]>([]);
  const [deletingTournaments, setDeletingTournaments] = useState(false);
  const [selectedHoleIds, setSelectedHoleIds] = useState<readonly string[]>([]);
  const [deletingHoles, setDeletingHoles] = useState(false);
  const [creatingSeason, setCreatingSeason] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('seasons');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return true;
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      dashboardSectionGroups.map((group) => [group.label, true])
    )
  );
  const [seasonActionError, setSeasonActionError] = useState<string | undefined>(undefined);
  const [playerSort, setPlayerSort] = useState<{
    key: PlayerSortKey;
    direction: 'ascending' | 'descending';
  }>({ key: 'displayName', direction: 'ascending' });
  const [tournamentSort, setTournamentSort] = useState<{
    key: TournamentSortKey;
    direction: 'ascending' | 'descending';
  }>({ key: 'scheduledOn', direction: 'descending' });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = () => {
      setSidebarCollapsed(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetchPlayers(),
      fetchSeasons(),
      fetchSponsors(),
      fetchSponsorshipTiers(),
      fetchSponsorshipDeals(),
      fetchTicketTypes(),
      fetchTicketPurchases(),
      fetchTeams(),
      fetchTournaments(),
      fetchCourses(),
      fetchHoles(),
      fetchTournamentRegistrations(),
      fetchDepartments(),
      fetchProjects(),
      fetchReimbursementClaims(),
      fetchFantasyLeagues(),
      fetchFantasyMemberships(),
      fetchFantasyTournaments(),
      fetchFantasyTeams(),
      fetchDrafts(),
      fetchOrganizationUsers()
    ]).then(
      ([
        players,
        seasons,
        sponsors,
        sponsorshipTiers,
        sponsorshipDeals,
        ticketTypes,
        ticketPurchases,
        teams,
        tournaments,
        courses,
        holes,
        registrations,
        departments,
        projects,
        claims,
        fantasyLeagues,
        fantasyMemberships,
        fantasyTournaments,
        fantasyTeams,
        drafts,
        users
      ]) => {
        if (!cancelled) {
          setData({
            players,
            seasons,
            sponsors,
            sponsorshipTiers,
            sponsorshipDeals,
            ticketTypes,
            ticketPurchases,
            teams,
            tournaments,
            courses,
            holes,
            registrations,
            departments,
            projects,
            claims,
            fantasyLeagues,
            fantasyMemberships,
            fantasyTournaments,
            fantasyTeams,
            drafts,
            users
          });
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const selectedFantasyLeague = data?.fantasyLeagues.find((league) => league.id === fantasyLeagueId) ?? data?.fantasyLeagues[0];

  const handleFantasyJoin = async () => {
    if (selectedFantasyLeague === undefined) {
      setFantasyActionError('Create a league before requesting to join.');
      return;
    }
    setFantasyBusy(true);
    setFantasyActionError(undefined);
    try {
      const targetUserId = fantasyMemberUserId || currentUser?.id || data?.users[0]?.id;
      if (targetUserId === undefined) {
        throw new Error('Select an organization user to join.');
      }
      await requestFantasyLeagueMembership({
        leagueId: selectedFantasyLeague.id,
        userId: targetUserId,
        role: 'participant'
      });
      setFantasyMemberUserId('');
      onDepartmentsChanged?.();
    } catch (caught) {
      setFantasyActionError(caught instanceof Error ? caught.message : 'Could not request membership.');
    } finally {
      setFantasyBusy(false);
    }
  };

  const handleFantasyApprove = async (membershipId: string, leagueId: string) => {
    setFantasyBusy(true);
    setFantasyActionError(undefined);
    try {
      await approveFantasyLeagueMembership({ leagueId, membershipId });
      onDepartmentsChanged?.();
    } catch (caught) {
      setFantasyActionError(caught instanceof Error ? caught.message : 'Could not approve membership.');
    } finally {
      setFantasyBusy(false);
    }
  };

  const handleFantasyCreateTournament = async () => {
    if (selectedFantasyLeague === undefined) {
      setFantasyActionError('Select a league to create a fantasy tournament.');
      return;
    }
    setFantasyBusy(true);
    setFantasyActionError(undefined);
    try {
      await createFantasyTournament(selectedFantasyLeague.id, {
        name: fantasyTournamentName.trim() || undefined,
        scheduledAt: new Date().toISOString()
      });
      setFantasyTournamentName('');
      onDepartmentsChanged?.();
    } catch (caught) {
      setFantasyActionError(
        caught instanceof Error ? caught.message : 'Could not create the tournament.'
      );
    } finally {
      setFantasyBusy(false);
    }
  };

  const handleSeedFantasyLeague = async () => {
    setFantasyBusy(true);
    setFantasyActionError(undefined);
    try {
      await seedFantasyLeague({
        name: fantasySeedName.trim() || undefined,
        participantUserIds: data?.users.map((user) => user.id).slice(0, 5),
        tournamentCount: 2,
        timerSeconds: 60
      });
      setFantasySeedName('');
      onDepartmentsChanged?.();
    } catch (caught) {
      setFantasyActionError(
        caught instanceof Error ? caught.message : 'Could not seed the fantasy league.'
      );
    } finally {
      setFantasyBusy(false);
    }
  };

  const sortPlayers = (key: PlayerSortKey) => {
    setPlayerSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    }));
  };

  const sortedPlayers = [...(data?.players ?? [])].sort((left, right) => {
    const leftValue =
      playerSort.key === 'team'
        ? getPlayerTeamName(left.id, data?.teams ?? [])
        : playerSort.key === 'active'
          ? left.active ? 'active' : 'inactive'
          : left[playerSort.key] ?? '';
    const rightValue =
      playerSort.key === 'team'
        ? getPlayerTeamName(right.id, data?.teams ?? [])
        : playerSort.key === 'active'
          ? right.active ? 'active' : 'inactive'
          : right[playerSort.key] ?? '';
    const comparison = String(leftValue).localeCompare(String(rightValue));
    return playerSort.direction === 'ascending' ? comparison : -comparison;
  });

  const sortTournaments = (key: TournamentSortKey) => {
    setTournamentSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    }));
  };

  const sortedTournaments = [...(data?.tournaments ?? [])].sort(
    (left, right) => {
      const leftValue =
        tournamentSort.key === 'scheduledOn'
          ? left.scheduledOn === undefined
            ? 0
            : new Date(left.scheduledOn).getTime()
          : left[tournamentSort.key] ?? '';
      const rightValue =
        tournamentSort.key === 'scheduledOn'
          ? right.scheduledOn === undefined
            ? 0
            : new Date(right.scheduledOn).getTime()
          : right[tournamentSort.key] ?? '';
      const comparison =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : leftValue.localeCompare(rightValue);
      return tournamentSort.direction === 'ascending' ? comparison : -comparison;
    }
  );

  const toggleTournament = (tournamentId: string) => {
    setSelectedTournamentIds((current) =>
      current.includes(tournamentId)
        ? current.filter((id) => id !== tournamentId)
        : [...current, tournamentId]
    );
  };

  const toggleAllTournaments = () => {
    const tournamentIds = data?.tournaments.map((tournament) => tournament.id) ?? [];
    setSelectedTournamentIds((current) =>
      current.length === tournamentIds.length ? [] : tournamentIds
    );
  };

  const deleteSelectedTournaments = async () => {
    if (selectedTournamentIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedTournamentIds.length.toString()} selected tournament(s)? Tournaments with registrations cannot be deleted.`)) return;
    setDeletingTournaments(true);
    setSeasonActionError(undefined);
    try {
      await deleteTournaments(selectedTournamentIds);
      setSelectedTournamentIds([]);
      onDepartmentsChanged?.();
    } catch (caught) {
      setSeasonActionError(
        caught instanceof Error ? caught.message : 'Could not delete tournaments.'
      );
    } finally {
      setDeletingTournaments(false);
    }
  };

  const toggleHole = (holeId: string) => {
    setSelectedHoleIds((current) =>
      current.includes(holeId)
        ? current.filter((id) => id !== holeId)
        : [...current, holeId]
    );
  };

  const toggleAllHoles = () => {
    const holeIds = data?.holes.map((hole) => hole.id) ?? [];
    setSelectedHoleIds((current) =>
      current.length === holeIds.length ? [] : holeIds
    );
  };

  const deleteSelectedHoles = async () => {
    if (selectedHoleIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedHoleIds.length.toString()} selected hole(s)?`)) return;
    setDeletingHoles(true);
    setSeasonActionError(undefined);
    try {
      await deleteHoles(selectedHoleIds);
      setSelectedHoleIds([]);
      onDepartmentsChanged?.();
    } catch (caught) {
      setSeasonActionError(
        caught instanceof Error ? caught.message : 'Could not delete holes.'
      );
    } finally {
      setDeletingHoles(false);
    }
  };

  return (
    <div className="flex min-h-[720px] w-full overflow-hidden border border-l-0 border-r-0 bg-background shadow-sm">
      <aside
        className={[
          'flex shrink-0 flex-col border-r bg-muted/20 transition-all duration-200',
          sidebarCollapsed ? 'w-16 md:w-20' : 'w-56 md:w-64',
          'md:sticky md:top-0'
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b px-3">
          <span
            className={[
              'text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground',
              sidebarCollapsed ? 'sr-only' : ''
            ].join(' ')}
          >
            Dashboard
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={() => {
              setSidebarCollapsed((current) => !current);
            }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            onClick={() => {
              setSidebarCollapsed((current) => !current);
            }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-2">
          {dashboardSectionGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.label] ?? true;
            const groupHeaderClass = groupHeaderStyles[group.label as keyof typeof groupHeaderStyles];

            return (
              <div key={group.label} className="flex flex-col gap-1">
                {!sidebarCollapsed && (
                  <button
                    type="button"
                    onClick={() => {
                      setCollapsedGroups((current) => ({
                        ...current,
                        [group.label]: !(current[group.label] ?? true)
                      }));
                    }}
                    className={[
                      'flex items-center justify-between rounded-md border px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:opacity-90',
                      groupHeaderClass
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {group.label}
                    </span>
                    <ChevronRight className={['h-3.5 w-3.5 transition-transform', isCollapsed ? '' : 'rotate-90'].join(' ')} />
                  </button>
                )}

                {!isCollapsed && group.items.map((section) => {
                  const isSelected = activeSection === section.value;
                  const Icon = sectionIcons[section.value];
                  const linkStyles = groupLinkStyles[group.label as keyof typeof groupLinkStyles];

                  return (
                    <Button
                      key={section.value}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size={sidebarCollapsed ? 'icon-sm' : 'sm'}
                      className={[
                        'justify-start gap-2 border',
                        sidebarCollapsed ? 'px-2' : 'px-3',
                        isSelected ? linkStyles.selected : linkStyles.default
                      ].join(' ')}
                      onClick={() => {
                        setActiveSection(section.value);
                      }}
                      aria-current={isSelected ? 'page' : undefined}
                      title={section.label}
                    >
                      <span className={['flex h-5 w-5 items-center justify-center rounded-md border border-current/20 bg-transparent text-current', isSelected ? 'border-current/30' : ''].join(' ')}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {!sidebarCollapsed && (
                        <span className="truncate">{section.label}</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="md:hidden"
              onClick={() => {
                setSidebarCollapsed((current) => !current);
              }}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
            <span className="text-lg font-semibold tracking-tight">
              {dashboardSections.find((section) => section.value === activeSection)?.label ?? 'Dashboard'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">Workspace</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <>
            {activeSection === 'players' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      ['id', 'ID'],
                      ['displayName', 'Name'],
                      ['brand', 'Brand'],
                      ['team', 'Team'],
                      ['playerType', 'Type'],
                      ['active', 'Status']
                    ].map(([key, label]) => {
                      const sortKey = key as PlayerSortKey;
                      const isSorted = playerSort.key === sortKey;
                      return (
                        <TableHead
                          key={sortKey}
                          aria-sort={
                            isSorted ? playerSort.direction : 'none'
                          }
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="-ml-3"
                            onClick={() => {
                              sortPlayers(sortKey);
                            }}
                          >
                            {label}
                            <ArrowDownUp />
                          </Button>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>{player.id}</TableCell>
                      <TableCell>{player.displayName}</TableCell>
                      <TableCell>{player.brand ?? 'FLI Golf League'}</TableCell>
                      <TableCell>
                        {getPlayerTeamName(player.id, data?.teams ?? []) || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {player.playerType === 'professional'
                            ? 'professional'
                            : 'student'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={player.active ? 'default' : 'secondary'}>
                          {player.active ? 'active' : 'inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeSection === 'seasons' && (
              <>
                <div className="mb-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log('Reset demo data clicked');
                      const nextReset = resetDemoSeasonAndSponsorData();
                      console.log('Reset payload', nextReset);

                      void fetchSeasons().then((nextSeasons) => {
                        console.log('Refetched seasons after reset', nextSeasons);
                        setData((current) => {
                          if (current === undefined) {
                            return current;
                          }
                          return {
                            ...current,
                            seasons: nextSeasons
                          };
                        });
                      });

                      onDepartmentsChanged?.();
                    }}
                  >
                    Reset demo data
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCreatingSeason(true);
                    }}
                    disabled={(data?.seasons.length ?? 0) === 0}
                  >
                    <Plus />
                    New season
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>League</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Ends</TableHead>
                      <TableHead>Yearly purse</TableHead>
                      <TableHead>Title sponsor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.seasons.map((season) => {
                      const titleSponsor = resolveTitleSponsorForTarget({
                        targetType: 'season',
                        targetId: season.id,
                        sponsors: data?.sponsors ?? [],
                        deals: data?.sponsorshipDeals ?? []
                      });

                      return (
                        <TableRow key={season.id}>
                          <TableCell>{season.name}</TableCell>
                          <TableCell>{season.brand ?? season.name}</TableCell>
                          <TableCell>{season.leagueId}</TableCell>
                          <TableCell>{formatDateOnlyUtc(season.startsOn)}</TableCell>
                          <TableCell>{formatDateOnlyUtc(season.endsOn)}</TableCell>
                          <TableCell>
                            {(season.yearlyPurseMinorUnits / 100).toLocaleString(
                              undefined,
                              {
                                style: 'currency',
                                currency: season.yearlyPurseCurrency,
                                maximumFractionDigits: 0
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            {titleSponsor.status === 'not-assigned' ? (
                              <span className="text-muted-foreground">Not assigned</span>
                            ) : titleSponsor.status === 'conflict' ? (
                              <span className="font-medium text-amber-600 dark:text-amber-400">Title sponsor conflict</span>
                            ) : titleSponsor.sponsor ? (
                              <div className="flex items-center gap-2">
                                {titleSponsor.sponsor.logoUrl && (
                                  <img
                                    src={titleSponsor.sponsor.logoUrl}
                                    alt={titleSponsor.sponsor.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium">{titleSponsor.sponsor.brandName ?? titleSponsor.sponsor.name}</span>
                                  {titleSponsor.status === 'prospective' && (
                                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
                                      Prospective
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                season.status === 'current' ? 'default' : 'outline'
                              }
                            >
                              {season.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Edit ${season.name}`}
                                onClick={() => {
                                  setEditingSeason(season);
                                }}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Delete ${season.name}`}
                                onClick={() => {
                                  if (!window.confirm(`Delete ${season.name}? Seasons with tournaments cannot be deleted.`)) return;
                                  void deleteSeason(season.id).then(
                                    () => onDepartmentsChanged?.(),
                                    (caught: unknown) => {
                                      setSeasonActionError(
                                        caught instanceof Error
                                          ? caught.message
                                          : 'Could not delete season.'
                                      );
                                    }
                                  );
                                }}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {editingSeason !== undefined && (
                  <EditSeasonModal
                    season={editingSeason}
                    sponsors={data?.sponsors ?? []}
                    deals={data?.sponsorshipDeals ?? []}
                    onClose={() => {
                      setEditingSeason(undefined);
                    }}
                    onSaved={onDepartmentsChanged ?? (() => undefined)}
                  />
                )}
                {creatingSeason && data?.seasons[0] !== undefined && (
                  <NewSeasonModal
                    leagueId={data.seasons[0].leagueId}
                    onClose={() => {
                      setCreatingSeason(false);
                    }}
                    onSaved={onDepartmentsChanged ?? (() => undefined)}
                  />
                )}
                {seasonActionError !== undefined && (
                  <p className="mt-3 text-sm text-destructive">{seasonActionError}</p>
                )}
              </>
            )}

            {activeSection === 'teams' && (
              <div className="flex flex-col gap-4">
                <AddTeamForm players={data?.players ?? []} onAdded={onDepartmentsChanged} />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Male player</TableHead>
                      <TableHead>Female player</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell>{team.id}</TableCell>
                        <TableCell>{team.brand ?? team.name}</TableCell>
                        <TableCell>{team.malePlayerId}</TableCell>
                        <TableCell>{team.femalePlayerId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeSection === 'tournaments' && (
              <div className="flex flex-col gap-4">
                <AddTournamentForm
                  courses={data?.courses ?? []}
                  seasons={data?.seasons ?? []}
                  onAdded={onDepartmentsChanged}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedTournamentIds.length.toString()} selected
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={selectedTournamentIds.length === 0 || deletingTournaments}
                    onClick={() => {
                      void deleteSelectedTournaments();
                    }}
                  >
                    <Trash2 />
                    {deletingTournaments ? 'Deleting...' : 'Delete selected'}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          aria-label="Select all tournaments"
                          checked={
                            (data?.tournaments.length ?? 0) > 0 &&
                            selectedTournamentIds.length === data?.tournaments.length
                          }
                          onChange={toggleAllTournaments}
                          className="size-4 accent-primary"
                        />
                      </TableHead>
                      {[
                        ['id', 'ID'],
                        ['name', 'Name'],
                        ['brand', 'Brand'],
                        ['scheduledOn', 'Date'],
                        ['courseId', 'Course'],
                        ['type', 'Type']
                      ].map(([key, label]) => {
                        const sortKey = key as TournamentSortKey;
                        const isSorted = tournamentSort.key === sortKey;
                        return (
                          <TableHead
                            key={sortKey}
                            aria-sort={
                              isSorted ? tournamentSort.direction : 'none'
                            }
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="-ml-3"
                              onClick={() => {
                                sortTournaments(sortKey);
                              }}
                            >
                              {label}
                              <ArrowDownUp />
                            </Button>
                          </TableHead>
                        );
                      })}
                      <TableHead className="w-16"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTournaments.map((tournament) => (
                      <TableRow key={tournament.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            aria-label={`Select ${tournament.name}`}
                            checked={selectedTournamentIds.includes(tournament.id)}
                            onChange={() => {
                              toggleTournament(tournament.id);
                            }}
                            className="size-4 accent-primary"
                          />
                        </TableCell>
                        <TableCell>{tournament.id}</TableCell>
                        <TableCell>{tournament.name}</TableCell>
                        <TableCell>{tournament.brand ?? 'FLI Golf League'}</TableCell>
                        <TableCell>
                          {tournament.scheduledOn === undefined
                            ? '—'
                            : new Date(tournament.scheduledOn).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{tournament.courseId ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tournament.type === 'fli' ? 'FLI' : 'Multi Round'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${tournament.name}`}
                              onClick={() => {
                                setEditingTournament(tournament);
                              }}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${tournament.name}`}
                              onClick={() => {
                                if (!window.confirm(`Delete ${tournament.name}? Tournaments with registrations cannot be deleted.`)) return;
                                void deleteTournament(tournament.id).then(
                                  () => onDepartmentsChanged?.(),
                                  (caught: unknown) => {
                                    setSeasonActionError(
                                      caught instanceof Error
                                        ? caught.message
                                        : 'Could not delete tournament.'
                                    );
                                  }
                                );
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {editingTournament !== undefined && (
                  <EditTournamentModal
                    tournament={editingTournament}
                    seasons={data?.seasons ?? []}
                    courses={data?.courses ?? []}
                    onClose={() => {
                      setEditingTournament(undefined);
                    }}
                    onSaved={onDepartmentsChanged ?? (() => undefined)}
                  />
                )}
                {seasonActionError !== undefined && (
                  <p className="text-sm text-destructive">{seasonActionError}</p>
                )}
              </div>
            )}

            {activeSection === 'sponsors' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Mock/demo sponsor records and existing sponsorship relationships from the current app schema.
                  </p>
                  <Badge variant="outline">Demo data</Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Logo</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Linked season / tournament</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deal value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.sponsors ?? []).map((sponsor) => {
                      const sponsorDeals = (data?.sponsorshipDeals ?? []).filter(
                        (deal) => deal.sponsorId === sponsor.id
                      );

                      if (sponsorDeals.length === 0) {
                        return (
                          <TableRow key={sponsor.id}>
                            <TableCell>
                              <SponsorLogo sponsor={sponsor} />
                            </TableCell>
                            <TableCell>{sponsor.name}</TableCell>
                            <TableCell>{sponsor.category}</TableCell>
                            <TableCell className="text-muted-foreground">No current sponsorship relationship</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{sponsor.status}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">No deal data in current mock schema.</TableCell>
                          </TableRow>
                        );
                      }

                      return sponsorDeals.map((deal) => {
                        const targetName =
                          deal.targetType === 'season'
                            ? getSeasonNameById(deal.targetId, data?.seasons ?? [])
                            : deal.targetType === 'tournament'
                              ? getTournamentNameById(deal.targetId, data?.tournaments ?? [])
                              : deal.targetId;

                        const dealValueLabel =
                          deal.status === 'lead' || deal.status === 'proposal'
                            ? 'Proposed'
                            : 'Contracted';

                        return (
                          <TableRow key={deal.id}>
                            <TableCell>
                              <SponsorLogo sponsor={sponsor} />
                            </TableCell>
                            <TableCell>{sponsor.name}</TableCell>
                            <TableCell>{sponsor.category}</TableCell>
                            <TableCell>{targetName}</TableCell>
                            <TableCell>
                              {getSponsorTierNameById(deal.tierId, data?.sponsorshipTiers ?? [])}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  deal.status === 'active' || deal.status === 'paid'
                                    ? 'default'
                                    : deal.status === 'proposal'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {deal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{dealValueLabel}</span>
                                <span>{formatCurrency(deal.contractValue)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeSection === 'tickets' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Minimal tournament admission inventory and purchase activity for the demo league.
                  </p>
                  <Badge variant="outline">Demo ticketing</Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Tournament</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.ticketTypes ?? []).map((ticketType) => (
                      <TableRow key={ticketType.id}>
                        <TableCell>{ticketType.name}</TableCell>
                        <TableCell>{getTournamentNameById(ticketType.tournamentId, data?.tournaments ?? [])}</TableCell>
                        <TableCell>{formatCurrency(ticketType.priceMinorUnits / 100)}</TableCell>
                        <TableCell>{ticketType.capacity ?? 'Unlimited'}</TableCell>
                        <TableCell>
                          <Badge variant={ticketType.active ? 'default' : 'secondary'}>
                            {ticketType.active ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Charge</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.ticketPurchases ?? []).map((purchase) => {
                      const ticketType = (data?.ticketTypes ?? []).find((item) => item.id === purchase.ticketTypeId);
                      return (
                        <TableRow key={purchase.id}>
                          <TableCell>{purchase.purchaserName}</TableCell>
                          <TableCell>{ticketType?.name ?? purchase.ticketTypeId}</TableCell>
                          <TableCell>{purchase.quantity}</TableCell>
                          <TableCell>{formatCurrency(purchase.totalMinorUnits / 100)}</TableCell>
                          <TableCell>{purchase.source}</TableCell>
                          <TableCell>
                            <Badge variant={purchase.status === 'paid' ? 'default' : purchase.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {purchase.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeSection === 'groups' && (
              <TournamentSetup
                tournaments={data?.tournaments ?? []}
                courses={data?.courses ?? []}
                users={data?.users ?? []}
              />
            )}

            {activeSection === 'scoring' && (
              <ScorekeeperWorklist
                user={currentUser}
                tournaments={data?.tournaments ?? []}
                courses={data?.courses ?? []}
              />
            )}

            {activeSection === 'courses' && (
              <div className="flex flex-col gap-4">
                <AddCourseForm onAdded={onDepartmentsChanged} />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Holes</TableHead>
                      <TableHead className="w-16"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{course.name}</span>
                            <span className="text-xs text-muted-foreground">{course.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>{course.brand ?? 'FLI Golf League'}</TableCell>
                        <TableCell>{course.holeCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${course.name}`}
                              onClick={() => {
                                setEditingCourse(course);
                              }}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${course.name}`}
                              onClick={() => {
                                if (!window.confirm(`Delete ${course.name}? Courses with holes or tournaments cannot be deleted.`)) return;
                                void deleteCourse(course.id).then(
                                  () => onDepartmentsChanged?.(),
                                  (caught: unknown) => {
                                    setSeasonActionError(
                                      caught instanceof Error
                                        ? caught.message
                                        : 'Could not delete course.'
                                    );
                                  }
                                );
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {editingCourse !== undefined && (
                  <EditCourseModal
                    course={editingCourse}
                    onClose={() => {
                      setEditingCourse(undefined);
                    }}
                    onSaved={onDepartmentsChanged ?? (() => undefined)}
                  />
                )}
                {seasonActionError !== undefined && (
                  <p className="text-sm text-destructive">{seasonActionError}</p>
                )}
              </div>
            )}

            {activeSection === 'holes' && (
              <div className="flex flex-col gap-4">
                <AddHoleForm courses={data?.courses ?? []} onAdded={onDepartmentsChanged} />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedHoleIds.length.toString()} selected
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={selectedHoleIds.length === 0 || deletingHoles}
                    onClick={() => {
                      void deleteSelectedHoles();
                    }}
                  >
                    <Trash2 />
                    {deletingHoles ? 'Deleting...' : 'Delete selected'}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          aria-label="Select all holes"
                          checked={
                            (data?.holes.length ?? 0) > 0 &&
                            selectedHoleIds.length === data?.holes.length
                          }
                          onChange={toggleAllHoles}
                          className="size-4 accent-primary"
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Par</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Basket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.holes.map((hole) => (
                      <TableRow key={hole.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            aria-label={`Select ${hole.id}`}
                            checked={selectedHoleIds.includes(hole.id)}
                            onChange={() => {
                              toggleHole(hole.id);
                            }}
                            className="size-4 accent-primary"
                          />
                        </TableCell>
                        <TableCell>{hole.id}</TableCell>
                        <TableCell>{getCourseNameById(hole.courseId, data?.courses ?? [])}</TableCell>
                        <TableCell>{hole.brand ?? 'FLI Golf League'}</TableCell>
                        <TableCell>{hole.number}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{hole.name ?? getHoleDisplayName(hole, data?.courses ?? [])}</span>
                            <span className="text-xs text-muted-foreground">{hole.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>{hole.par}</TableCell>
                        <TableCell>
                          {hole.distanceFeet === undefined
                            ? '—'
                            : `${hole.distanceFeet.toString()} ft`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={hole.blueBasket ? 'default' : 'secondary'}
                            className={hole.blueBasket
                              ? 'inline-flex items-center gap-1.5 rounded-full border border-blue-600/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-200'
                              : 'inline-flex items-center gap-1.5 rounded-full border border-red-600/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-700 dark:text-red-200'}
                          >
                            <span
                              className={`inline-block size-1.5 rounded-full ${hole.blueBasket ? 'bg-blue-600 dark:bg-blue-400' : 'bg-red-600 dark:bg-red-400'}`}
                            />
                            {hole.blueBasket ? 'Blue' : 'Red'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeSection === 'registrations' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Registered at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.tournamentId}</TableCell>
                      <TableCell>{registration.playerId}</TableCell>
                      <TableCell>{registration.brand ?? 'FLI Golf League'}</TableCell>
                      <TableCell>
                        {new Date(registration.registeredAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeSection === 'fantasy' && (
              <div className="flex flex-col gap-4">
                <FantasySeedControls />
                <AddFantasyLeagueForm
                  players={data?.players ?? []}
                  onAdded={onDepartmentsChanged}
                />
                <AddFantasyTeamForm
                  leagues={data?.fantasyLeagues ?? []}
                  players={data?.players ?? []}
                  onAdded={onDepartmentsChanged}
                />

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1">
                      <Label htmlFor="fantasy-league-selector">League</Label>
                      <ObjectSelect
                        id="fantasy-league-selector"
                        value={fantasyLeagueId ?? selectedFantasyLeague?.id ?? ''}
                        onValueChange={(value) => {
                          setFantasyLeagueId(value);
                        }}
                        options={(data?.fantasyLeagues ?? []).map((league) => ({
                          id: league.id,
                          label: league.name
                        }))}
                        placeholder="Select league"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="fantasy-user-selector">User</Label>
                      <ObjectSelect
                        id="fantasy-user-selector"
                        value={fantasyMemberUserId}
                        onValueChange={setFantasyMemberUserId}
                        options={(data?.users ?? []).map((user) => ({
                          id: user.id,
                          label: `${user.name} (${user.id})`
                        }))}
                        placeholder="Choose member"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <Button type="button" disabled={fantasyBusy || selectedFantasyLeague === undefined} onClick={handleFantasyJoin}>
                      Request join
                    </Button>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="fantasy-tournament-name">Fantasy tournament name</Label>
                      <Input
                        id="fantasy-tournament-name"
                        value={fantasyTournamentName}
                        onChange={(event) => {
                          setFantasyTournamentName(event.target.value);
                        }}
                        placeholder="e.g. Final Round"
                      />
                    </div>
                    <Button type="button" disabled={fantasyBusy || selectedFantasyLeague === undefined} onClick={handleFantasyCreateTournament}>
                      Create tournament
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end">
                    <div className="flex-1">
                      <Label htmlFor="fantasy-seed-name">Seed league name</Label>
                      <Input
                        id="fantasy-seed-name"
                        value={fantasySeedName}
                        onChange={(event) => {
                          setFantasySeedName(event.target.value);
                        }}
                        placeholder="Optional league name"
                      />
                    </div>
                    <Button type="button" variant="outline" disabled={fantasyBusy} onClick={handleSeedFantasyLeague}>
                      Seed league + draft
                    </Button>
                  </div>

                  {fantasyActionError !== undefined && (
                    <p className="mt-3 text-sm text-destructive">{fantasyActionError}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-medium">Leagues</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Participants</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.fantasyLeagues ?? []).map((league) => (
                          <TableRow key={league.id}>
                            <TableCell>{league.id}</TableCell>
                            <TableCell>{league.name}</TableCell>
                            <TableCell>{league.brand ?? 'FLI Golf League'}</TableCell>
                            <TableCell>{league.participantIds.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium">Teams</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Roster</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.fantasyTeams ?? []).map((team) => (
                          <TableRow key={team.id}>
                            <TableCell>{team.id}</TableCell>
                            <TableCell>{team.name}</TableCell>
                            <TableCell>{team.ownerId}</TableCell>
                            <TableCell>{team.playerIds.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-medium">Membership requests</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>League</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.fantasyMemberships ?? []).map((membership) => (
                          <TableRow key={membership.id}>
                            <TableCell>{membership.userId}</TableCell>
                            <TableCell>{membership.leagueId}</TableCell>
                            <TableCell>
                              <Badge variant={membership.state === 'approved' ? 'default' : 'secondary'}>
                                {membership.state}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {membership.state !== 'approved' && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={fantasyBusy}
                                  onClick={() => {
                                    void handleFantasyApprove(membership.id, membership.leagueId);
                                  }}
                                >
                                  Approve
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="mb-2 font-medium">Fantasy tournaments</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>League</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Draft</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.fantasyTournaments ?? []).map((tournament) => (
                          <TableRow key={tournament.id}>
                            <TableCell>{tournament.name}</TableCell>
                            <TableCell>{tournament.leagueId}</TableCell>
                            <TableCell>
                              <Badge variant={tournament.status === 'completed' ? 'default' : 'secondary'}>
                                {tournament.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{tournament.draftRoomId ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'drafts' && (
              <DraftsBoard
                drafts={data?.drafts ?? []}
                leagues={data?.fantasyLeagues ?? []}
                players={data?.players ?? []}
                onChanged={onDepartmentsChanged}
              />
            )}

            {activeSection === 'departments' && (
              <div className="flex flex-col gap-4">
                <AddDepartmentForm onAdded={onDepartmentsChanged} />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Head</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>{department.id}</TableCell>
                        <TableCell>{department.name}</TableCell>
                        <TableCell>{department.brand ?? 'FLI Golf League'}</TableCell>
                        <TableCell>
                          {(department.headName?.trim().length ?? 0) > 0
                            ? department.headName
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeSection === 'projects' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.id}</TableCell>
                      <TableCell>{project.departmentId}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.brand ?? 'FLI Golf League'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeSection === 'claims' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>{claim.id}</TableCell>
                      <TableCell>{claim.departmentId}</TableCell>
                      <TableCell>
                        {(claim.totalMinorUnits / 100).toFixed(2)}{' '}
                        {claim.currency}
                      </TableCell>
                      <TableCell>{claim.brand ?? 'FLI Golf League'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{claim.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        </main>
      </div>
    </div>
  );
}
