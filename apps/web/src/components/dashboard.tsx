import { useEffect, useState, type SyntheticEvent } from 'react';
import { ArrowDownUp, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  addCourse,
  addFantasyLeague,
  addFantasyTeam,
  addHole,
  addOrganizationDepartment,
  addTeam,
  addTournament,
  createSeason,
  deleteSeason,
  deleteCourse,
  deleteHoles,
  deleteTournament,
  deleteTournaments,
  createDraft,
  fetchCourses,
  fetchDepartments,
  fetchDrafts,
  fetchFantasyLeagues,
  fetchFantasyTeams,
  fetchHoles,
  fetchPlayers,
  fetchProjects,
  fetchReimbursementClaims,
  fetchSeasons,
  fetchTeams,
  fetchTournamentRegistrations,
  fetchTournamentTeeGroups,
  clearTournamentTeeGroups,
  fetchTournaments,
  makeDraftPick,
  openDraft,
  seedFantasy,
  seedSixTournaments,
  seedTurfParadiseLayout,
  seedTournamentTeeGroups,
  seedAllTournamentTeeGroups,
  updateTournament,
  updateCourse,
  updateSeason,
  type CourseDto,
  type DepartmentDto,
  type DraftRoomDto,
  type FantasyLeagueDto,
  type FantasyTeamDto,
  type HoleDto,
  type PlayerDto,
  type ProjectDto,
  type ReimbursementClaimDto,
  type SeasonDto,
  type TeamDto,
  type TournamentDto,
  type TournamentTeeGroupDto,
  type TournamentRegistrationDto
} from '@/lib/api.js';
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
  readonly teams: readonly TeamDto[];
  readonly tournaments: readonly TournamentDto[];
  readonly courses: readonly CourseDto[];
  readonly holes: readonly HoleDto[];
  readonly registrations: readonly TournamentRegistrationDto[];
  readonly departments: readonly DepartmentDto[];
  readonly projects: readonly ProjectDto[];
  readonly claims: readonly ReimbursementClaimDto[];
  readonly fantasyLeagues: readonly FantasyLeagueDto[];
  readonly fantasyTeams: readonly FantasyTeamDto[];
  readonly drafts: readonly DraftRoomDto[];
}

type PlayerSortKey = 'id' | 'displayName' | 'team' | 'playerType' | 'active';
type TournamentSortKey =
  | 'id'
  | 'name'
  | 'seasonId'
  | 'scheduledOn'
  | 'courseId'
  | 'type';

const getPlayerTeamName = (
  playerId: string,
  teams: readonly TeamDto[]
): string =>
  teams.find(
    (team) => team.malePlayerId === playerId || team.femalePlayerId === playerId
  )?.name ?? '';

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
  onClose,
  onSaved
}: {
  readonly season: SeasonDto;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState(season.name);
  const [startsOn, setStartsOn] = useState(season.startsOn.slice(0, 10));
  const [endsOn, setEndsOn] = useState(season.endsOn.slice(0, 10));
  const [yearlyPurse, setYearlyPurse] = useState(
    (season.yearlyPurseMinorUnits / 100).toString()
  );
  const [status, setStatus] = useState(season.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const save = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await updateSeason(season.id, {
        name,
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
  const [seedingAll, setSeedingAll] = useState(false);

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
        {seeding ? 'Seeding 6...' : 'Seed 6'}
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
  tournaments
}: {
  readonly tournaments: readonly TournamentDto[];
}) {
  const [tournamentId, setTournamentId] = useState('');
  const [groups, setGroups] = useState<readonly TournamentTeeGroupDto[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (tournamentId === '') {
      setGroups([]);
      return;
    }
    void fetchTournamentTeeGroups(tournamentId).then(setGroups);
  }, [tournamentId]);

  const tournament = tournaments.find((entry) => entry.id === tournamentId);

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

function AddTeamForm({
  players,
  onAdded
}: {
  readonly players: readonly PlayerDto[];
  readonly onAdded?: () => void;
}) {
  const [name, setName] = useState('');
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
      await addTeam({ name, malePlayerId, femalePlayerId });
      setName('');
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
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [seedingLayout, setSeedingLayout] = useState(false);
  const selectedCourse = courses.find((course) => course.id === courseId);

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
        par: Number(par) || 3
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

  const seedLayout = async () => {
    if (courseId === '') return;
    setSeedingLayout(true);
    setError(undefined);
    try {
      await seedTurfParadiseLayout(courseId);
      onAdded?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not seed Turf Paradise.'
      );
    } finally {
      setSeedingLayout(false);
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
            setNumber(event.target.value);
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
      <Button type="submit" disabled={courseId === '' || submitting}>
        {submitting ? 'Adding…' : 'Add hole'}
      </Button>
      {selectedCourse?.holeCount === 9 && (
        <Button
          type="button"
          variant="outline"
          disabled={seedingLayout || submitting}
          onClick={() => {
            void seedLayout();
          }}
        >
          {seedingLayout ? 'Seeding layout...' : 'Seed Turf Paradise layout'}
        </Button>
      )}
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
  onDepartmentsChanged
}: {
  readonly refreshKey: number;
  readonly onDepartmentsChanged?: () => void;
}) {
  const [data, setData] = useState<DashboardData | undefined>(undefined);
  const [editingSeason, setEditingSeason] = useState<SeasonDto | undefined>(undefined);
  const [editingTournament, setEditingTournament] = useState<TournamentDto | undefined>(undefined);
  const [editingCourse, setEditingCourse] = useState<CourseDto | undefined>(undefined);
  const [selectedTournamentIds, setSelectedTournamentIds] = useState<readonly string[]>([]);
  const [deletingTournaments, setDeletingTournaments] = useState(false);
  const [selectedHoleIds, setSelectedHoleIds] = useState<readonly string[]>([]);
  const [deletingHoles, setDeletingHoles] = useState(false);
  const [creatingSeason, setCreatingSeason] = useState(false);
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
    let cancelled = false;

    void Promise.all([
      fetchPlayers(),
      fetchSeasons(),
      fetchTeams(),
      fetchTournaments(),
      fetchCourses(),
      fetchHoles(),
      fetchTournamentRegistrations(),
      fetchDepartments(),
      fetchProjects(),
      fetchReimbursementClaims(),
      fetchFantasyLeagues(),
      fetchFantasyTeams(),
      fetchDrafts()
    ]).then(
      ([
        players,
        seasons,
        teams,
        tournaments,
        courses,
        holes,
        registrations,
        departments,
        projects,
        claims,
        fantasyLeagues,
        fantasyTeams,
        drafts
      ]) => {
        if (!cancelled) {
          setData({
            players,
            seasons,
            teams,
            tournaments,
            courses,
            holes,
            registrations,
            departments,
            projects,
            claims,
            fantasyLeagues,
            fantasyTeams,
            drafts
          });
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

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
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="seasons">
          <TabsList>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="holes">Holes</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    ['id', 'ID'],
                    ['displayName', 'Name'],
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
          </TabsContent>
          <TabsContent value="seasons">
            <div className="mb-4 flex justify-end">
              <Button type="button" onClick={() => { setCreatingSeason(true); }} disabled={(data?.seasons.length ?? 0) === 0}>
                <Plus />
                New season
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead>Yearly purse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.seasons.map((season) => (
                  <TableRow key={season.id}>
                    <TableCell>{season.name}</TableCell>
                    <TableCell>{season.leagueId}</TableCell>
                    <TableCell>{new Date(season.startsOn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(season.endsOn).toLocaleDateString()}</TableCell>
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
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${season.name}`} onClick={() => { setEditingSeason(season); }}><Pencil /></Button>
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
                                setSeasonActionError(caught instanceof Error ? caught.message : 'Could not delete season.');
                              }
                            );
                          }}
                        ><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {editingSeason !== undefined && (
              <EditSeasonModal
                season={editingSeason}
                onClose={() => {
                  setEditingSeason(undefined);
                }}
                onSaved={onDepartmentsChanged ?? (() => undefined)}
              />
            )}
            {creatingSeason && data?.seasons[0] !== undefined && (
              <NewSeasonModal
                leagueId={data.seasons[0].leagueId}
                onClose={() => { setCreatingSeason(false); }}
                onSaved={onDepartmentsChanged ?? (() => undefined)}
              />
            )}
            {seasonActionError !== undefined && <p className="mt-3 text-sm text-destructive">{seasonActionError}</p>}
          </TabsContent>
          <TabsContent value="teams">
            <div className="flex flex-col gap-4">
              <AddTeamForm
                players={data?.players ?? []}
                onAdded={onDepartmentsChanged}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Male player</TableHead>
                    <TableHead>Female player</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.id}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.malePlayerId}</TableCell>
                      <TableCell>{team.femalePlayerId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="tournaments">
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
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${tournament.name}`} onClick={() => { setEditingTournament(tournament); }}><Pencil /></Button>
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
                                  setSeasonActionError(caught instanceof Error ? caught.message : 'Could not delete tournament.');
                                }
                              );
                            }}
                          ><Trash2 /></Button>
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
                  onClose={() => { setEditingTournament(undefined); }}
                  onSaved={onDepartmentsChanged ?? (() => undefined)}
                />
              )}
              {seasonActionError !== undefined && <p className="text-sm text-destructive">{seasonActionError}</p>}
            </div>
          </TabsContent>
          <TabsContent value="groups">
            <TournamentSetup tournaments={data?.tournaments ?? []} />
          </TabsContent>
          <TabsContent value="courses">
            <div className="flex flex-col gap-4">
              <AddCourseForm onAdded={onDepartmentsChanged} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Holes</TableHead>
                    <TableHead className="w-16"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.id}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.holeCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${course.name}`} onClick={() => { setEditingCourse(course); }}><Pencil /></Button>
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
                                  setSeasonActionError(caught instanceof Error ? caught.message : 'Could not delete course.');
                                }
                              );
                            }}
                          ><Trash2 /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {editingCourse !== undefined && (
                <EditCourseModal
                  course={editingCourse}
                  onClose={() => { setEditingCourse(undefined); }}
                  onSaved={onDepartmentsChanged ?? (() => undefined)}
                />
              )}
              {seasonActionError !== undefined && <p className="text-sm text-destructive">{seasonActionError}</p>}
            </div>
          </TabsContent>
          <TabsContent value="holes">
            <div className="flex flex-col gap-4">
              <AddHoleForm
                courses={data?.courses ?? []}
                onAdded={onDepartmentsChanged}
              />
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
                    <TableHead>Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Par</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Blue basket</TableHead>
                    <TableHead>Red basket</TableHead>
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
                      <TableCell>{hole.courseId}</TableCell>
                      <TableCell>{hole.number}</TableCell>
                      <TableCell>{hole.name ?? '—'}</TableCell>
                      <TableCell>{hole.par}</TableCell>
                      <TableCell>
                        {hole.distanceFeet === undefined
                          ? '—'
                          : `${hole.distanceFeet.toString()} ft`}
                      </TableCell>
                      <TableCell>{hole.blueBasketPosition ?? '—'}</TableCell>
                      <TableCell>{hole.redBasketPosition ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="registrations">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Registered at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.tournamentId}</TableCell>
                      <TableCell>{registration.playerId}</TableCell>
                      <TableCell>
                        {new Date(registration.registeredAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="fantasy">
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Leagues</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Participants</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.fantasyLeagues.map((league) => (
                        <TableRow key={league.id}>
                          <TableCell>{league.id}</TableCell>
                          <TableCell>{league.name}</TableCell>
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
                      {data?.fantasyTeams.map((team) => (
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
            </div>
          </TabsContent>
          <TabsContent value="drafts">
            <DraftsBoard
              drafts={data?.drafts ?? []}
              leagues={data?.fantasyLeagues ?? []}
              players={data?.players ?? []}
              onChanged={onDepartmentsChanged}
            />
          </TabsContent>
          <TabsContent value="departments">
            <div className="flex flex-col gap-4">
              <AddDepartmentForm onAdded={onDepartmentsChanged} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Head</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>{department.id}</TableCell>
                      <TableCell>{department.name}</TableCell>
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
          </TabsContent>
          <TabsContent value="projects">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.departmentId}</TableCell>
                    <TableCell>{project.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="claims">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">{claim.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
