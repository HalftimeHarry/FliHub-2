import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Crown,
  MapPinned,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  UsersRound
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppNavbar, type AppView } from '@/components/app-navbar.js';
import { Dashboard } from '@/components/dashboard.js';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { ObjectDiagram } from '@/components/object-diagram.js';
import { Pipelines } from '@/components/pipelines.js';
import {
  componentOptions,
  StartGuide,
  type OrganizationSetup
} from '@/components/start-guide.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.js';
import { Label } from '@/components/ui/label.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.js';
import {
  addFantasyLeague,
  createOrganizationAdmin,
  deleteCustomOrganization,
  fetchCourses,
  fetchFantasyLeagues,
  fetchFantasyMemberships,
  fetchOrganization,
  fetchOrganizationUsers,
  fetchPlayers,
  fetchSeasons,
  fetchTeams,
  fetchTournamentRegistrations,
  fetchTournamentTeeGroups,
  fetchTournaments,
  fetchUsers,
  getOrganizationCatalog,
  getUserCatalog,
  isCustomOrganization,
  registerCustomOrganization,
  registerOrganizationDepartments,
  seedDefaultOrganizations,
  setActiveOrganization,
  setActiveUser,
  type CourseDto,
  type FantasyLeagueDto,
  type FantasyMembershipDto,
  type OrganizationDto,
  type PlayerDto,
  type SeasonDto,
  type TeamDto,
  type TournamentDto,
  type TournamentRegistrationDto,
  type TournamentTeeGroupDto,
  type UserDto
} from '@/lib/api.js';
import { BrandLogo } from '@/components/brand-logo.js';
import { ThemeProvider } from '@/components/theme-provider.js';
import { leagueBrandSeed, teamBrandSeed } from '@/lib/brand-seed.js';
import { sortProsForDisplay, type ProRosterSortKey } from '@/lib/player-table.js';

const roleLabels: Record<UserDto['role'], string> = {
  leader: 'Leader',
  admin: 'Admin',
  business_staff: 'Business staff',
  manager: 'Manager',
  player: 'Player',
  vendor: 'Vendor',
  broadcaster: 'Broadcaster'
};

const organizationLabels: Record<string, string> = {
  fgl: 'FLI Golf',
  'org-2': 'Example School',
  'org-custom': 'Custom Demo League'
};

function UserSwitcher({
  users,
  currentUserId,
  onChange
}: {
  users: readonly UserDto[];
  currentUserId: string | undefined;
  onChange: (userId: string) => void;
}) {
  const currentUser = users.find((user) => user.id === currentUserId);

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="user-switcher" className="text-sm text-muted-foreground">
        Viewing as
      </Label>
      <Select value={currentUserId} onValueChange={onChange}>
        <SelectTrigger id="user-switcher" className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name} · {roleLabels[user.role]}
              {user.canScorekeep ? ' · Scorekeeper' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentUser !== undefined && (
        <Badge variant="outline">
          {organizationLabels[currentUser.organizationId] ??
            currentUser.organizationId}
        </Badge>
      )}
    </div>
  );
}

function OrganizationSwitcher({
  organizations,
  selectedOrganizationId,
  onChange
}: {
  readonly organizations: readonly OrganizationDto[];
  readonly selectedOrganizationId: string;
  readonly onChange: (organizationId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Label
        htmlFor="organization-switcher"
        className="text-sm text-muted-foreground"
      >
        Organization
      </Label>
      <Select value={selectedOrganizationId} onValueChange={onChange}>
        <SelectTrigger id="organization-switcher" className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((organization) => (
            <SelectItem key={organization.id} value={organization.id}>
              {organization.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LandingPage({
  currentUser,
  organizationId,
  organizations,
  onOrganizationChange,
  organizationUsers
}: {
  readonly currentUser: UserDto | undefined;
  readonly organizationId: string;
  readonly organizations: readonly OrganizationDto[];
  readonly onOrganizationChange: (organizationId: string) => void;
  readonly organizationUsers: readonly UserDto[];
}) {
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<readonly SeasonDto[]>([]);
  const [teams, setTeams] = useState<readonly TeamDto[]>([]);
  const [players, setPlayers] = useState<readonly PlayerDto[]>([]);
  const [tournaments, setTournaments] = useState<readonly TournamentDto[]>([]);
  const [courses, setCourses] = useState<readonly CourseDto[]>([]);
  const [registrations, setRegistrations] = useState<readonly TournamentRegistrationDto[]>([]);
  const [fantasyLeagues, setFantasyLeagues] = useState<readonly FantasyLeagueDto[]>([]);
  const [fantasyMemberships, setFantasyMemberships] = useState<readonly FantasyMembershipDto[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<readonly TournamentTeeGroupDto[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<(typeof teamBrandSeed)[number] | null>(null);
  const [isPlayersPageOpen, setPlayersPageOpen] = useState(false);
  const [proRosterSort, setProRosterSort] = useState<{ key: ProRosterSortKey; direction: 'asc' | 'desc' }>({
    key: 'team',
    direction: 'asc'
  });
  const tournamentsSectionRef = useRef<HTMLDivElement | null>(null);
  const leagueSectionRef = useRef<HTMLDivElement | null>(null);
  const [leagueName, setLeagueName] = useState('');
  const [inviteUserId, setInviteUserId] = useState<string>('');
  const [leagueBusy, setLeagueBusy] = useState(false);
  const [leagueError, setLeagueError] = useState<string | undefined>(undefined);
  const [leagueSuccess, setLeagueSuccess] = useState<string | undefined>(undefined);

  useEffect(() => {
    void Promise.all([
      fetchSeasons(),
      fetchTeams(),
      fetchPlayers(),
      fetchTournaments(),
      fetchCourses(),
      fetchTournamentRegistrations(),
      fetchFantasyLeagues(),
      fetchFantasyMemberships(),
      fetchOrganizationUsers()
    ]).then(([nextSeasons, nextTeams, nextPlayers, nextTournaments, nextCourses, nextRegistrations, nextFantasyLeagues, nextFantasyMemberships]) => {
      setSeasons(nextSeasons);
      setTeams(nextTeams);
      setPlayers(nextPlayers);
      setTournaments(nextTournaments);
      setCourses(nextCourses);
      setRegistrations(nextRegistrations);
      setFantasyLeagues(nextFantasyLeagues);
      setFantasyMemberships(nextFantasyMemberships);
      setLoading(false);
    });
  }, [organizationId]);

  const currentSeason =
    seasons.find((season) => season.status === 'current') ??
    [...seasons].sort((left, right) => new Date(left.startsOn).getTime() - new Date(right.startsOn).getTime()).at(-1);

  const normalizeBrandKey = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const normalizeTeamName = normalizeBrandKey;

  const selectedTeamRecord =
    selectedTeam === null
      ? null
      : teams.find((team) => {
          const teamId = team.id.replace(/^team-/, '');
          return (
            team.id === selectedTeam.id.replace(/^team-/, '') ||
            team.id === selectedTeam.id ||
            normalizeTeamName(team.name) === normalizeTeamName(selectedTeam.name) ||
            normalizeTeamName(teamId) === normalizeTeamName(selectedTeam.id.replace(/^team-/, ''))
          );
        }) ?? null;

  const selectedTeamPlayers =
    selectedTeamRecord === null
      ? []
      : players.filter(
          (player) =>
            player.id === selectedTeamRecord.malePlayerId ||
            player.id === selectedTeamRecord.femalePlayerId
        );

  const teamBrandMap = new Map<string, (typeof teamBrandSeed)[number]>();
  for (const team of teamBrandSeed) {
    teamBrandMap.set(normalizeBrandKey(team.name), team);
    teamBrandMap.set(normalizeBrandKey(team.shortName), team);
    teamBrandMap.set(normalizeBrandKey(team.id), team);
  }
  const teamLogoSet = teamBrandSeed;
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const currentTournaments = tournaments.filter(
    (tournament) => tournament.seasonId === currentSeason?.id
  );
  const activePlayersCount = players.filter((player) => player.active).length;
  const teamLookup = new Map(teams.map((team) => [team.malePlayerId, team.name]));
  for (const team of teams) {
    teamLookup.set(team.femalePlayerId, team.name);
  }
  const proRosterRows = sortProsForDisplay(
    players
      .filter((player) => player.active && player.playerType === 'professional')
      .map((player) => ({
        id: player.id,
        displayName: player.displayName,
        teamName: teamLookup.get(player.id) ?? 'Unassigned',
        playerType: player.playerType,
        active: player.active,
        status: player.active ? 'active' : 'inactive'
      })),
    proRosterSort.key,
    proRosterSort.direction
  );
  const totalCurrentSeasonRegistrations = registrations.filter((registration) =>
    currentTournaments.some((tournament) => tournament.id === registration.tournamentId)
  ).length;
  const handleJumpToEvents = () => {
    if (currentTournaments.length > 0) {
      setSelectedTournamentId(currentTournaments[0]?.id ?? null);
    }
    tournamentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleJumpToLeagues = () => {
    setPlayersPageOpen(false);
    leagueSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const selectedTournament = currentTournaments.find(
    (tournament) => tournament.id === selectedTournamentId
  );

  useEffect(() => {
    if (selectedTournament === undefined) {
      setSelectedGroups([]);
      return;
    }

    setDetailLoading(true);
    void fetchTournamentTeeGroups(selectedTournament.id)
      .then((groups) => {
        setSelectedGroups(groups);
      })
      .catch(() => {
        setSelectedGroups([]);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  }, [selectedTournament?.id]);

  const handleCreateLeague = async () => {
    const name = leagueName.trim();
    if (name.length === 0) {
      setLeagueError('Choose a league name before creating your fantasy league.');
      return;
    }

    setLeagueBusy(true);
    setLeagueError(undefined);
    setLeagueSuccess(undefined);

    try {
      const created = await addFantasyLeague({
        name,
        participantIds: inviteUserId ? [inviteUserId] : undefined
      });
      setFantasyLeagues((current) => [created, ...current]);
      setLeagueName('');
      setInviteUserId('');
      setLeagueSuccess(`League created successfully: ${created.name}`);
    } catch (caught) {
      setLeagueError(
        caught instanceof Error ? caught.message : 'Could not create the league.'
      );
    } finally {
      setLeagueBusy(false);
    }
  };

  const inviteOptions = organizationUsers.filter(
    (user) => user.id !== currentUser?.id && user.organizationId === organizationId
  );

  return (
    <div className="space-y-6 p-6">
      <section
        className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[#f3f4f6] p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] lg:p-8 dark:border-slate-800 dark:bg-slate-900"
        style={{
          backgroundImage: `radial-gradient(circle at top right, ${leagueBrandSeed.colors.primaryColor}12, transparent 22%), linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(243,244,246,1) 100%)`
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.78),_transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:items-stretch">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/60">
              <Badge
                className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
              >
                <Sparkles className="mr-1 size-3.5" />
                Community landing page
              </Badge>

              <div className="mt-4 space-y-3">
                <div className="max-w-xs space-y-1.5">
                  <Label
                    htmlFor="landing-organization-switcher"
                    className="text-xs text-muted-foreground"
                  >
                    Organizations
                  </Label>
                  <Select
                    value={organizationId}
                    onValueChange={onOrganizationChange}
                  >
                    <SelectTrigger
                      id="landing-organization-switcher"
                      className="w-full bg-white/80 dark:bg-slate-900/80"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((organization) => (
                        <SelectItem key={organization.id} value={organization.id}>
                          {organization.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">
                  <span className="inline-flex rounded-full border border-slate-300 bg-white/80 px-2 py-1 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                    {organizations.find((organization) => organization.id === organizationId)?.name ?? 'FLI Golf'}{' '}
                    • {currentSeason ? currentSeason.name : 'Season preview'}
                  </span>
                </p>
                <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white sm:text-5xl lg:text-[4rem]">
                  <span className="text-slate-900 dark:text-white">Summer golf,</span>{' '}
                  <span className="text-slate-700 dark:text-slate-200">built for community.</span>
                </h2>
                <p className="max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                  Discover the current season, follow standout tournaments, and create your own invite-only league with a premium club-style experience.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                  Explore tournaments
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Create league
                </Button>
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-slate-100/80 p-2 shadow-inner dark:border-slate-700 dark:bg-slate-950/50">
              <div className="flex flex-wrap gap-2">
                {teamLogoSet.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    aria-label={`View details for ${team.name}`}
                    title={team.name}
                    className="group flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-950/80 dark:hover:border-slate-600"
                    style={{
                      background: `linear-gradient(135deg, ${team.colors.secondaryColor} 0%, rgba(255,255,255,0.96) 100%)`,
                      boxShadow: `inset 0 0 0 1px ${team.colors.primaryColor}22`
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <BrandLogo
                        brand={team}
                        variant="mini"
                        className="flex h-7 items-center justify-center"
                        imgClassName="h-7 w-auto object-contain"
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition group-hover:text-black">
                        {team.shortName}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)] dark:border-slate-700 dark:bg-slate-950/70">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    League identity
                  </div>
                  <div className="mt-1 text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                    FLI Golf League
                  </div>
                </div>
                <BrandLogo
                  brand={leagueBrandSeed}
                  variant="mini"
                  className="flex h-11 items-center justify-center rounded-xl bg-slate-50 px-2 shadow-sm dark:bg-slate-800"
                  imgClassName="h-8 w-auto object-contain"
                />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={handleJumpToEvents}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-slate-600 dark:hover:bg-slate-900/80"
                >
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <CalendarDays className="size-3.5 text-sky-600 dark:text-sky-300" />
                    Events
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{currentTournaments.length}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayersPageOpen(true)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-slate-600 dark:hover:bg-slate-900/80"
                >
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <UsersRound className="size-3.5 text-emerald-600 dark:text-emerald-300" />
                    Players
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{activePlayersCount}</div>
                </button>
                <button
                  type="button"
                  onClick={handleJumpToLeagues}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-slate-600 dark:hover:bg-slate-900/80"
                >
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <Trophy className="size-3.5 text-amber-600 dark:text-amber-300" />
                    Leagues
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{fantasyLeagues.length}</div>
                </button>
              </div>
            </div>

            <div
              ref={leagueSectionRef}
              className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                <Crown className="size-4 text-amber-500" />
                Create your own league
              </div>
              <div className="space-y-3">
                <Input
                  value={leagueName}
                  onChange={(event) => setLeagueName(event.target.value)}
                  placeholder="League name"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-600"
                />
                <div className="space-y-1">
                  <label htmlFor="landing-page-invite" className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Invite a teammate
                  </label>
                  <select
                    id="landing-page-invite"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-0 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus-visible:ring-slate-600"
                    value={inviteUserId}
                    onChange={(event) => setInviteUserId(event.target.value)}
                  >
                    <option value="" className="text-slate-900 dark:text-white">No invite selected</option>
                    {inviteOptions.map((user) => (
                      <option key={user.id} value={user.id} className="text-slate-900 dark:text-white">
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateLeague}
                  disabled={leagueBusy}
                  size="lg"
                  className="w-full rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {leagueBusy ? 'Creating...' : 'Create league'}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                {leagueError !== undefined && (
                  <p className="text-sm text-rose-600 dark:text-rose-300">{leagueError}</p>
                )}
                {leagueSuccess !== undefined && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-300">{leagueSuccess}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-emerald-200/80 bg-white/75 p-4 shadow-[0_16px_40px_-28px_rgba(15,118,110,0.8)] backdrop-blur-sm dark:border-emerald-700/60 dark:bg-slate-900/70">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Current season tournaments
                </h3>
                {currentSeason !== undefined && (
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px]">
                    {currentSeason.startsOn.slice(0, 10)} → {currentSeason.endsOn.slice(0, 10)}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                {currentTournaments.slice(0, 3).map((tournament) => (
                  <div
                    key={tournament.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-700 dark:bg-slate-950/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {tournament.name}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {tournament.status ?? 'scheduled'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {courseMap.get(tournament.courseId ?? '')?.name ?? 'Course TBA'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-3 dark:border-emerald-700/60 dark:from-emerald-950/30 dark:via-slate-900/70 dark:to-slate-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Community pulse
                </h3>
                <BrandLogo
                  brand={leagueBrandSeed}
                  variant="mini"
                  className="flex h-8 items-center justify-center rounded-lg bg-white/70 px-2 shadow-sm"
                  imgClassName="h-6 w-auto object-contain"
                />
              </div>

              <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Season snapshot
              </div>

              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Active events
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {currentTournaments.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Registered players
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {totalCurrentSeasonRegistrations}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Fantasy leagues
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {fantasyLeagues.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isPlayersPageOpen ? (
        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                League roster
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Professionals
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setPlayersPageOpen(false)}
            >
              Back to landing page
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <Table className="min-w-full text-sm">
              <TableHeader className="bg-slate-50 dark:bg-slate-950/80">
                <TableRow>
                  <TableHead className="w-[35%]">
                    <button
                      type="button"
                      onClick={() => setProRosterSort((current) => ({
                        key: 'name',
                        direction: current.key === 'name' && current.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                      className="font-medium text-slate-700 dark:text-slate-200"
                    >
                      Player
                    </button>
                  </TableHead>
                  <TableHead className="w-[30%]">
                    <button
                      type="button"
                      onClick={() => setProRosterSort((current) => ({
                        key: 'team',
                        direction: current.key === 'team' && current.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                      className="font-medium text-slate-700 dark:text-slate-200"
                    >
                      Team
                    </button>
                  </TableHead>
                  <TableHead className="w-[20%]">
                    <button
                      type="button"
                      onClick={() => setProRosterSort((current) => ({
                        key: 'status',
                        direction: current.key === 'status' && current.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                      className="font-medium text-slate-700 dark:text-slate-200"
                    >
                      Status
                    </button>
                  </TableHead>
                  <TableHead className="w-[15%] text-right">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proRosterRows.map((player) => (
                  <TableRow key={player.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/90">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-50">{player.displayName}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{player.teamName}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {player.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-600 dark:text-slate-300">{player.playerType ?? 'player'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/80">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  <Trophy className="size-4 text-amber-500" />
                  Current season tournaments
                </h3>
                {currentSeason !== undefined && (
                  <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs">
                    {currentSeason.startsOn.slice(0, 10)} → {currentSeason.endsOn.slice(0, 10)}
                  </Badge>
                )}
              </div>

              {loading ? (
                <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
                  Loading current season data...
                </div>
              ) : currentTournaments.length === 0 ? (
                <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
                  No tournaments are currently scheduled for this season.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTournaments.map((tournament) => {
                    const course = courseMap.get(tournament.courseId ?? '');
                    const registrationCount = registrations.filter(
                      (registration) => registration.tournamentId === tournament.id
                    ).length;

                    const isSelected = selectedTournamentId === tournament.id;

                    return (
                      <div
                        key={tournament.id}
                        className={[
                          'rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/80',
                          isSelected ? 'border-sky-300/80 shadow-md ring-1 ring-sky-200/80 dark:border-sky-500/60 dark:ring-sky-500/20' : ''
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                              {tournament.type}
                            </p>
                            <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                              {tournament.name}
                            </h4>
                          </div>
                          <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide">
                            {tournament.status ?? 'scheduled'}
                          </Badge>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                              Course
                            </div>
                            <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                              {course?.name ?? 'Course TBA'}
                            </div>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                              Time
                            </div>
                            <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                              {tournament.scheduledOn !== undefined
                                ? new Date(tournament.scheduledOn).toLocaleString()
                                : 'Schedule pending'}
                            </div>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                              Players
                            </div>
                            <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                              {registrationCount}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Public season listing • {currentSeason?.name ?? 'Current season'}
                          </div>
                          <Button
                            type="button"
                            variant={isSelected ? 'secondary' : 'outline'}
                            size="lg"
                            className={isSelected ? 'rounded-full' : 'rounded-full border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200'}
                            onClick={() => {
                              setSelectedTournamentId((current) =>
                                current === tournament.id ? null : tournament.id
                              );
                            }}
                          >
                            {isSelected ? 'Hide details' : 'View details'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <div className="rounded-[28px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4 shadow-[0_16px_40px_-28px_rgba(15,118,110,0.8)] dark:border-emerald-700/60 dark:from-emerald-950/30 dark:via-slate-900/70 dark:to-slate-900">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                      Community pulse
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Season snapshot
                    </h3>
                  </div>
                  <BrandLogo
                    brand={leagueBrandSeed}
                    variant="mini"
                    className="flex h-9 items-center justify-center rounded-xl bg-white/70 px-2 shadow-sm"
                    imgClassName="h-7 w-auto object-contain"
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Active events
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                      {currentTournaments.length}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Registered players
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                      {totalCurrentSeasonRegistrations}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Fantasy leagues
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                      {fantasyLeagues.length}
                    </div>
                  </div>
                </div>

                {selectedTournament === undefined ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                    Select a tournament to view the full schedule and tee details.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                          {selectedTournament.type}
                        </p>
                        <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                          {selectedTournament.name}
                        </h4>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedTournamentId(null)}
                      >
                        Hide details
                      </Button>
                    </div>

                    <dl className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          Course
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                          {courseMap.get(selectedTournament.courseId ?? '')?.name ?? 'Course TBA'}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          Scheduled
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                          {selectedTournament.scheduledOn !== undefined
                            ? new Date(selectedTournament.scheduledOn).toLocaleString()
                            : 'Pending'}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          Registrations
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                          {registrations.filter((registration) => registration.tournamentId === selectedTournament.id).length} players
                        </dd>
                      </div>
                    </dl>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        Tee groups and scorekeepers
                      </p>
                      {detailLoading ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Loading tee groups...</p>
                      ) : selectedGroups.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No tee groups have been seeded for this tournament yet.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {selectedGroups.map((group) => (
                            <div key={group.id} className="rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                  Group {group.number}
                                </span>
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                                  {group.teeTime}
                                </span>
                              </div>
                              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                {group.teamNames.map((teamName) => {
                                  const teamBrand =
                                    teamBrandMap.get(normalizeBrandKey(teamName)) ??
                                    teamBrandSeed.find(
                                      (candidate) =>
                                        normalizeBrandKey(candidate.name) ===
                                          normalizeBrandKey(teamName)
                                    );
                                  const teamBackground = teamBrand !== undefined
                                    ? {
                                        borderLeftColor: teamBrand.colors.primaryColor,
                                        background: `linear-gradient(90deg, ${teamBrand.colors.secondaryColor} 0%, rgba(255,255,255,0.72) 100%)`,
                                        borderColor: `${teamBrand.colors.primaryColor}33`
                                      }
                                    : undefined;

                                  return (
                                    <li
                                      key={teamName}
                                      className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-950/40"
                                      style={teamBackground}
                                    >
                                      <span
                                        className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white dark:bg-slate-900"
                                        style={{
                                          boxShadow: teamBrand !== undefined ? `inset 0 0 0 1px ${teamBrand.colors.primaryColor}33` : undefined
                                        }}
                                      >
                                        {teamBrand !== undefined ? (
                                          <BrandLogo
                                            brand={teamBrand}
                                            variant="mini"
                                            className="flex h-7 w-7 items-center justify-center"
                                            imgClassName="h-6 w-auto object-contain"
                                          />
                                        ) : (
                                          <span className="size-1.5 rounded-full bg-sky-500" />
                                        )}
                                      </span>
                                      <span className="font-medium text-slate-800 dark:text-slate-100">{teamName}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                Scorekeeper: <span className="font-medium text-slate-900 dark:text-slate-100">{group.scorekeeperName ?? 'Unassigned'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </section>
        </>
      )}

      {selectedTeam !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.6)] dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-details-title"
            style={{
              backgroundImage: `linear-gradient(135deg, ${selectedTeam.colors.secondaryColor} 0%, rgba(255,255,255,0.96) 38%, rgba(255,255,255,1) 100%)`,
              borderColor: `${selectedTeam.colors.primaryColor}55`
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                  style={{
                    background: `linear-gradient(135deg, ${selectedTeam.colors.primaryColor} 0%, ${selectedTeam.colors.secondaryColor} 100%)`,
                    borderColor: `${selectedTeam.colors.primaryColor}66`
                  }}
                >
                  <BrandLogo
                    brand={selectedTeam}
                    variant="mini"
                    className="flex h-12 w-12 items-center justify-center"
                    imgClassName="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Team profile
                  </p>
                  <h3 id="team-details-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {selectedTeam.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Short name
                </div>
                <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {selectedTeam.shortName}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Brand colors
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="inline-block h-5 w-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: selectedTeam.colors.primaryColor }}
                    title={selectedTeam.colors.primaryColor}
                  />
                  <span
                    className="inline-block h-5 w-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: selectedTeam.colors.secondaryColor }}
                    title={selectedTeam.colors.secondaryColor}
                  />
                  <span
                    className="inline-block h-5 w-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: selectedTeam.colors.accentColor }}
                    title={selectedTeam.colors.accentColor}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Team identity
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <BrandLogo
                  brand={selectedTeam}
                  variant="mini"
                  className="flex h-12 items-center justify-center"
                  imgClassName="h-10 w-auto object-contain"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {selectedTeam.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Active member of the current FLI Golf season
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Pros on the team
              </div>
              {selectedTeamPlayers.length === 0 ? (
                <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No pros are assigned to this team yet.
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {selectedTeamPlayers.map((player) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {player.displayName}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          {player.playerType ?? 'player'}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white dark:bg-slate-100 dark:text-slate-900">
                        Pro
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div ref={tournamentsSectionRef} className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              <Trophy className="size-4 text-amber-500" />
              Current season tournaments
            </h3>
            {currentSeason !== undefined && (
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs">
                {currentSeason.startsOn.slice(0, 10)} → {currentSeason.endsOn.slice(0, 10)}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
              Loading current season data...
            </div>
          ) : currentTournaments.length === 0 ? (
            <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
              No tournaments are currently scheduled for this season.
            </div>
          ) : (
            <div className="space-y-3">
              {currentTournaments.map((tournament) => {
                const course = courseMap.get(tournament.courseId ?? '');
                const registrationCount = registrations.filter(
                  (registration) => registration.tournamentId === tournament.id
                ).length;

                const isSelected = selectedTournamentId === tournament.id;

                return (
                  <div
                    key={tournament.id}
                    className={[
                      'rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/80',
                      isSelected ? 'border-sky-300/80 shadow-md ring-1 ring-sky-200/80 dark:border-sky-500/60 dark:ring-sky-500/20' : ''
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                          {tournament.type}
                        </p>
                        <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                          {tournament.name}
                        </h4>
                      </div>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide">
                        {tournament.status ?? 'scheduled'}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          Course
                        </div>
                        <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                          {course?.name ?? 'Course TBA'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          Time
                        </div>
                        <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                          {tournament.scheduledOn !== undefined
                            ? new Date(tournament.scheduledOn).toLocaleString()
                            : 'Schedule pending'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          Players
                        </div>
                        <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                          {registrationCount}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Public season listing • {currentSeason?.name ?? 'Current season'}
                      </div>
                      <Button
                        type="button"
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="lg"
                        className={isSelected ? 'rounded-full' : 'rounded-full border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200'}
                        onClick={() => {
                          setSelectedTournamentId((current) =>
                            current === tournament.id ? null : tournament.id
                          );
                        }}
                      >
                        {isSelected ? 'Hide details' : 'View details'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[28px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4 shadow-[0_16px_40px_-28px_rgba(15,118,110,0.8)] dark:border-emerald-700/60 dark:from-emerald-950/30 dark:via-slate-900/70 dark:to-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                  Community pulse
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Season snapshot
                </h3>
              </div>
              <BrandLogo
                brand={leagueBrandSeed}
                variant="mini"
                className="flex h-9 items-center justify-center rounded-xl bg-white/70 px-2 shadow-sm"
                imgClassName="h-7 w-auto object-contain"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Active events
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {currentTournaments.length}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Registered players
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {totalCurrentSeasonRegistrations}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-3 dark:border-emerald-700/60 dark:bg-slate-900/60">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Fantasy leagues
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {fantasyLeagues.length}
                </div>
              </div>
            </div>

            {selectedTournament === undefined ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                Select a tournament to view the full schedule and tee details.
              </div>
            ) : (
              <div className="mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      {selectedTournament.type}
                    </p>
                    <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {selectedTournament.name}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedTournamentId(null)}
                  >
                    Hide details
                  </Button>
                </div>

                <dl className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                    <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Course
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                      {courseMap.get(selectedTournament.courseId ?? '')?.name ?? 'Course TBA'}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                    <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Scheduled
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                      {selectedTournament.scheduledOn !== undefined
                        ? new Date(selectedTournament.scheduledOn).toLocaleString()
                        : 'Pending'}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                    <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Registrations
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                      {registrations.filter((registration) => registration.tournamentId === selectedTournament.id).length} players
                    </dd>
                  </div>
                </dl>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Tee groups and scorekeepers
                  </p>
                  {detailLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading tee groups...</p>
                  ) : selectedGroups.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No tee groups have been seeded for this tournament yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedGroups.map((group) => (
                        <div key={group.id} className="rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                              Group {group.number}
                            </span>
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                              {group.teeTime}
                            </span>
                          </div>
                          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                            {group.teamNames.map((teamName) => {
                              const teamBrand =
                                teamBrandMap.get(normalizeBrandKey(teamName)) ??
                                teamBrandSeed.find(
                                  (candidate) =>
                                    normalizeBrandKey(candidate.name) ===
                                      normalizeBrandKey(teamName)
                                );
                              const teamBackground = teamBrand !== undefined
                                ? {
                                    borderLeftColor: teamBrand.colors.primaryColor,
                                    background: `linear-gradient(90deg, ${teamBrand.colors.secondaryColor} 0%, rgba(255,255,255,0.72) 100%)`,
                                    borderColor: `${teamBrand.colors.primaryColor}33`
                                  }
                                : undefined;

                              return (
                                <li
                                  key={teamName}
                                  className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-950/40"
                                  style={teamBackground}
                                >
                                  <span
                                    className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white dark:bg-slate-900"
                                    style={{
                                      boxShadow: teamBrand !== undefined ? `inset 0 0 0 1px ${teamBrand.colors.primaryColor}33` : undefined
                                    }}
                                  >
                                    {teamBrand !== undefined ? (
                                      <BrandLogo
                                        brand={teamBrand}
                                        variant="mini"
                                        className="flex h-7 w-7 items-center justify-center"
                                        imgClassName="h-6 w-auto object-contain"
                                      />
                                    ) : (
                                      <span className="size-1.5 rounded-full bg-sky-500" />
                                    )}
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-slate-100">{teamName}</span>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            Scorekeeper: <span className="font-medium text-slate-900 dark:text-slate-100">{group.scorekeeperName ?? 'Unassigned'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function OrganizationOverview({
  organizationId,
  currentUser,
  userCount,
  organization,
  setup,
  canDelete,
  onDelete
}: {
  readonly organizationId: string;
  readonly currentUser: UserDto | undefined;
  readonly userCount: number;
  readonly organization: OrganizationDto | undefined;
  readonly setup: OrganizationSetup | undefined;
  readonly canDelete: boolean;
  readonly onDelete: () => void;
}) {
  const organizationName =
    setup?.organizationName ??
    organization?.name ??
    (organizationId === 'fgl' ? 'FLI Golf' : `Organization ${organizationId}`);
  const selectedLabels = new Map(
    componentOptions.map((component) => [component.id, component.label])
  );

  return (
    <Card className="border-sky-500/30 bg-sky-500/10">
      <CardHeader className="p-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex size-6 items-center justify-center rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <Building2 className="size-3.5" />
          </span>
          <span className="font-semibold">{organizationName}</span>
          <Badge variant="outline" className="text-[10px] leading-none">
            Active
          </Badge>
          <span className="text-muted-foreground">{organizationId}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{currentUser?.name ?? 'Loading'}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{userCount} users</span>
        </div>
        {(setup !== undefined || organization !== undefined) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-[10px] leading-none">
              {setup?.templateName ?? 'Organization configuration'}
            </Badge>
            {(setup?.selectedComponents ?? organization?.enabledComponents ?? []).map(
              (componentId) => (
                <Badge
                  key={componentId}
                  variant="secondary"
                  className="inline-flex items-center gap-1 text-[10px] leading-none"
                >
                  <Check className="size-3 text-emerald-500" />
                  {selectedLabels.get(componentId) ?? componentId}
                </Badge>
              )
            )}
          </div>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="self-start mt-1 h-7 px-2 text-xs"
            onClick={onDelete}
          >
            <Trash2 className="mr-1 size-3.5" />
            Delete
          </Button>
        )}
      </CardHeader>
      {setup !== undefined && setup.departments.length > 0 && (
        <CardContent className="border-t p-2 pt-2">
          <ul className="flex flex-wrap gap-1.5">
            {setup.departments.map((department) => (
              <li
                key={department.id}
                className="rounded-md bg-background/60 px-2 py-1 text-[10px] text-muted-foreground"
              >
                {department.name}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

export function App() {
  const [activeView, setActiveView] = useState<AppView>('landing-page');
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<readonly UserDto[]>([]);
  const [organizations, setOrganizations] = useState<
    readonly OrganizationDto[]
  >([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('fgl');
  const [organization, setOrganization] = useState<OrganizationDto | undefined>(
    undefined
  );
  const [organizationSetup, setOrganizationSetup] = useState<
    OrganizationSetup | undefined
  >(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    void Promise.all([fetchUsers(), seedDefaultOrganizations()]).then(
      ([fetchedUsers, seeded]) => {
        setUsers(fetchedUsers);
        setOrganizations(seeded);
        const savedOrganization = window.localStorage.getItem(
          'flihub-active-organization'
        );
        const savedUserId = window.localStorage.getItem('flihub-active-user');
        const nextOrganizationId =
          savedOrganization ??
          getOrganizationCatalog().find((organization) => organization.id === 'fgl')
            ?.id ??
          seeded[0].id;
        setActiveOrganization(nextOrganizationId);
        setSelectedOrganizationId(nextOrganizationId);
        const matchingUser =
          fetchedUsers.find(
            (user) =>
              user.id === savedUserId &&
              user.organizationId === nextOrganizationId
          ) ??
          fetchedUsers.find(
            (user) => user.organizationId === nextOrganizationId
          );
        if (matchingUser !== undefined) {
          setActiveUser(matchingUser.id);
          setCurrentUserId(matchingUser.id);
        } else {
          setCurrentUserId(undefined);
        }
      }
    );
  }, [refreshKey]);

  useEffect(() => {
    void fetchOrganization().then(setOrganization);
  }, [refreshKey]);

  const refreshDashboard = () => {
    setRefreshKey((key) => key + 1);
  };

  const handleOrganizationChange = (nextOrganizationId: string) => {
    setActiveOrganization(nextOrganizationId);
    setSelectedOrganizationId(nextOrganizationId);
    const matchingUser = users.find(
      (user) => user.organizationId === nextOrganizationId
    );
    if (matchingUser !== undefined) {
      setActiveUser(matchingUser.id);
      setCurrentUserId(matchingUser.id);
    } else {
      setCurrentUserId(undefined);
    }
    setRefreshKey((key) => key + 1);
  };

  const currentUser = users.find((user) => user.id === currentUserId);
  const organizationId = selectedOrganizationId;

  return (
    <ThemeProvider defaultTheme="dark" storageKey="flihub-ui-theme">
      <div className="min-h-screen bg-slate-100/80 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <AppNavbar activeView={activeView} onViewChange={setActiveView} />
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          {activeView === 'landing-page' ? (
            <LandingPage
              currentUser={currentUser}
              organizationId={organizationId}
              organizations={organizations}
              onOrganizationChange={handleOrganizationChange}
              organizationUsers={users.filter(
                (user) => user.organizationId === organizationId
              )}
            />
          ) : activeView === 'start-guide' ? (
            <StartGuide
              organizations={organizations}
              onRegistered={(setup) => {
                const customOrganization = registerCustomOrganization({
                  name: setup.organizationName,
                  enabledComponents: setup.selectedComponents
                });

                // Bootstrap an admin so the new org workspace is usable.
                const admin = createOrganizationAdmin(
                  customOrganization.id,
                  `${setup.organizationName} Admin`
                );

                // Persist the departments (and heads) captured in the wizard.
                registerOrganizationDepartments(
                  customOrganization.id,
                  setup.departments.map((department) => ({
                    name: department.name,
                    headName: department.headName
                  }))
                );

                setOrganizations(getOrganizationCatalog());
                setOrganizationSetup(setup);
                setUsers((current) => [
                  ...current.filter((user) => user.id !== admin.id),
                  admin
                ]);
                setActiveOrganization(customOrganization.id);
                setSelectedOrganizationId(customOrganization.id);
                setActiveUser(admin.id);
                setCurrentUserId(admin.id);
                setActiveView('home');
              }}
            />
          ) : activeView === 'diagram' ? (
            <ObjectDiagram refreshKey={refreshKey} />
          ) : activeView === 'pipelines' ? (
            <Pipelines />
          ) : (
            <>
              <header className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Organization workspace
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Start with your organization, then drill into its League and
                    Business workflows.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <OrganizationSwitcher
                    organizations={organizations}
                    selectedOrganizationId={organizationId}
                    onChange={handleOrganizationChange}
                  />
                  <UserSwitcher
                    users={users.filter(
                      (user) => user.organizationId === organizationId
                    )}
                    currentUserId={currentUserId}
                    onChange={(userId) => {
                      const selectedUser = users.find(
                        (user) => user.id === userId
                      );
                      if (selectedUser !== undefined) {
                        setActiveUser(selectedUser.id);
                        setActiveOrganization(selectedUser.organizationId);
                      }
                      setCurrentUserId(userId);
                      setRefreshKey((key) => key + 1);
                    }}
                  />
                </div>
              </header>
              <OrganizationOverview
                organizationId={organizationId}
                currentUser={currentUser}
                organization={organization}
                setup={organizationSetup}
                canDelete={isCustomOrganization(organizationId)}
                onDelete={() => {
                  if (!window.confirm(`Delete ${organization?.name ?? organizationId}? This removes its local admin and departments.`)) {
                    return;
                  }
                  deleteCustomOrganization(organizationId);
                  const nextOrganizationId = 'fgl';
                  const nextUsers = getUserCatalog();
                  const nextUser = nextUsers.find(
                    (user) => user.id === 'admin-1'
                  );
                  setOrganizations(getOrganizationCatalog());
                  setUsers(nextUsers);
                  setOrganizationSetup(undefined);
                  setActiveOrganization(nextOrganizationId);
                  setSelectedOrganizationId(nextOrganizationId);
                  if (nextUser !== undefined) {
                    setActiveUser(nextUser.id);
                    setCurrentUserId(nextUser.id);
                  }
                  setActiveView('start-guide');
                }}
                userCount={
                  users.filter((user) => user.organizationId === organizationId)
                    .length
                }
              />
              <Dashboard
                refreshKey={refreshKey}
                onDepartmentsChanged={refreshDashboard}
                currentUser={currentUser}
              />
            </>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
