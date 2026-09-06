import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  addCourse,
  addFantasyLeague,
  addFantasyTeam,
  addHole,
  addOrganizationDepartment,
  addTeam,
  addTournament,
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
  fetchTeams,
  fetchTournamentRegistrations,
  fetchTournaments,
  makeDraftPick,
  openDraft,
  seedFantasy,
  seedLeague,
  type CourseDto,
  type DepartmentDto,
  type DraftRoomDto,
  type FantasyLeagueDto,
  type FantasyTeamDto,
  type HoleDto,
  type PlayerDto,
  type ProjectDto,
  type ReimbursementClaimDto,
  type TeamDto,
  type TournamentDto,
  type TournamentRegistrationDto
} from '@/lib/api.js';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
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

function AddTournamentForm({
  courses,
  onAdded
}: {
  readonly courses: readonly CourseDto[];
  readonly onAdded?: () => void;
}) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('32');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      await addTournament({
        name,
        capacity: Number(capacity) || 32,
        courseId: courseId === '' ? undefined : courseId
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-tournament-capacity">Capacity</Label>
        <Input
          id="new-tournament-capacity"
          type="number"
          min={1}
          className="w-24"
          value={capacity}
          onChange={(event) => {
            setCapacity(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-tournament-course">Course</Label>
        <select
          id="new-tournament-course"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={courseId}
          onChange={(event) => {
            setCourseId(event.target.value);
          }}
        >
          <option value="">None</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={name.trim().length < 2 || submitting}>
        {submitting ? 'Adding…' : 'Add tournament'}
      </Button>
      {error !== undefined && (
        <p className="text-sm text-destructive sm:basis-full">{error}</p>
      )}
    </form>
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
          <select
            id="new-team-male"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={malePlayerId}
            onChange={(event) => {
              setMalePlayerId(event.target.value);
            }}
          >
            <option value="">Select</option>
            {malePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-team-female">Female player</Label>
          <select
            id="new-team-female"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={femalePlayerId}
            onChange={(event) => {
              setFemalePlayerId(event.target.value);
            }}
          >
            <option value="">Select</option>
            {femalePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.displayName}
              </option>
            ))}
          </select>
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

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="new-hole-course">Course</Label>
        <select
          id="new-hole-course"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={courseId}
          onChange={(event) => {
            setCourseId(event.target.value);
          }}
        >
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
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
          <select
            id="new-fantasy-team-league"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={fantasyLeagueId}
            onChange={(event) => {
              setFantasyLeagueId(event.target.value);
              setOwnerId('');
            }}
          >
            <option value="">Select league</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="new-fantasy-team-owner">Owner</Label>
          <select
            id="new-fantasy-team-owner"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={ownerId}
            onChange={(event) => {
              setOwnerId(event.target.value);
            }}
            disabled={fantasyLeagueId === ''}
          >
            <option value="">Select owner</option>
            {eligibleOwners.map((player) => (
              <option key={player.id} value={player.id}>
                {player.displayName}
              </option>
            ))}
          </select>
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
          <select
            id="draft-league"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={fantasyLeagueId}
            onChange={(event) => {
              setFantasyLeagueId(event.target.value);
            }}
          >
            <option value="">Select league</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
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
              <select
                id={`pick-${draft.id}`}
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={selectedPlayerId}
                onChange={(event) => {
                  setSelectedPlayerId(event.target.value);
                }}
              >
                <option value="">Choose…</option>
                {available.map((player) => (
                  <option key={player.id} value={player.id}>
                    {playerName(players, player.id)} (
                    {player.gender === 'male' ? 'M' : 'F'})
                  </option>
                ))}
              </select>
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
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | undefined>(undefined);
  const [seedParams, setSeedParams] = useState({
    tournaments: '3',
    courses: '1',
    holesPerCourse: '18',
    teams: '2'
  });

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetchPlayers(),
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

  const runSeed = async () => {
    setSeeding(true);
    setSeedError(undefined);
    try {
      await seedLeague({
        tournaments: Number(seedParams.tournaments) || 0,
        courses: Number(seedParams.courses) || 0,
        holesPerCourse: Number(seedParams.holesPerCourse) || 18,
        teams: Number(seedParams.teams) || 0
      });
      onDepartmentsChanged?.();
    } catch (caught) {
      setSeedError(
        caught instanceof Error ? caught.message : 'Seeding failed.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const SeedControls = () => (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="seed-tournaments">Tournaments</Label>
          <Input
            id="seed-tournaments"
            type="number"
            min={0}
            className="w-24"
            value={seedParams.tournaments}
            onChange={(event) => {
              setSeedParams((current) => ({
                ...current,
                tournaments: event.target.value
              }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="seed-courses">Courses</Label>
          <Input
            id="seed-courses"
            type="number"
            min={0}
            className="w-24"
            value={seedParams.courses}
            onChange={(event) => {
              setSeedParams((current) => ({
                ...current,
                courses: event.target.value
              }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="seed-holes">Holes / course</Label>
          <Input
            id="seed-holes"
            type="number"
            min={1}
            className="w-24"
            value={seedParams.holesPerCourse}
            onChange={(event) => {
              setSeedParams((current) => ({
                ...current,
                holesPerCourse: event.target.value
              }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="seed-teams">Teams</Label>
          <Input
            id="seed-teams"
            type="number"
            min={0}
            className="w-24"
            value={seedParams.teams}
            onChange={(event) => {
              setSeedParams((current) => ({
                ...current,
                teams: event.target.value
              }));
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
          {seeding ? 'Seeding…' : 'Seed league data'}
        </Button>
      </div>
      {seedError !== undefined && (
        <p className="text-sm text-destructive">{seedError}</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="players">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.id}</TableCell>
                    <TableCell>{player.displayName}</TableCell>
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
          <TabsContent value="teams">
            <div className="flex flex-col gap-4">
              <SeedControls />
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
              <SeedControls />
              <AddTournamentForm
                courses={data?.courses ?? []}
                onAdded={onDepartmentsChanged}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>{tournament.id}</TableCell>
                      <TableCell>{tournament.name}</TableCell>
                      <TableCell>{tournament.courseId ?? '—'}</TableCell>
                      <TableCell>{tournament.capacity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tournament.status ?? 'scheduled'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="courses">
            <div className="flex flex-col gap-4">
              <SeedControls />
              <AddCourseForm onAdded={onDepartmentsChanged} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Holes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.id}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.holeCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="holes">
            <div className="flex flex-col gap-4">
              <AddHoleForm
                courses={data?.courses ?? []}
                onAdded={onDepartmentsChanged}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Par</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.holes.map((hole) => (
                    <TableRow key={hole.id}>
                      <TableCell>{hole.id}</TableCell>
                      <TableCell>{hole.courseId}</TableCell>
                      <TableCell>{hole.number}</TableCell>
                      <TableCell>{hole.par}</TableCell>
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
