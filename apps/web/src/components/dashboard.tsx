import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  addCourse,
  addHole,
  addOrganizationDepartment,
  addTournament,
  fetchCourses,
  fetchDepartments,
  fetchHoles,
  fetchPlayers,
  fetchProjects,
  fetchReimbursementClaims,
  fetchTournamentRegistrations,
  fetchTournaments,
  seedLeague,
  type CourseDto,
  type DepartmentDto,
  type HoleDto,
  type PlayerDto,
  type ProjectDto,
  type ReimbursementClaimDto,
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
  readonly tournaments: readonly TournamentDto[];
  readonly courses: readonly CourseDto[];
  readonly holes: readonly HoleDto[];
  readonly registrations: readonly TournamentRegistrationDto[];
  readonly departments: readonly DepartmentDto[];
  readonly projects: readonly ProjectDto[];
  readonly claims: readonly ReimbursementClaimDto[];
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
    holesPerCourse: '18'
  });

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetchPlayers(),
      fetchTournaments(),
      fetchCourses(),
      fetchHoles(),
      fetchTournamentRegistrations(),
      fetchDepartments(),
      fetchProjects(),
      fetchReimbursementClaims()
    ]).then(
      ([
        players,
        tournaments,
        courses,
        holes,
        registrations,
        departments,
        projects,
        claims
      ]) => {
        if (!cancelled) {
          setData({
            players,
            tournaments,
            courses,
            holes,
            registrations,
            departments,
            projects,
            claims
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
        holesPerCourse: Number(seedParams.holesPerCourse) || 18
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
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="holes">Holes</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
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
