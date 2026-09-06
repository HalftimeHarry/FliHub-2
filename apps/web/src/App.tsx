import { Building2 } from 'lucide-react';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { AppNavbar, type AppView } from '@/components/app-navbar.js';
import { Dashboard } from '@/components/dashboard.js';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { ObjectDiagram } from '@/components/object-diagram.js';
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
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.js';
import {
  fetchDepartments,
  fetchOrganization,
  fetchPlayers,
  fetchProjects,
  fetchTournaments,
  fetchUsers,
  getOrganizationCatalog,
  getOrganizationHeaders,
  registerCustomOrganization,
  seedDefaultOrganizations,
  setActiveOrganization,
  setActiveUser,
  type DepartmentDto,
  type OrganizationDto,
  type PlayerDto,
  type ProjectDto,
  type TournamentDto,
  type UserDto
} from '@/lib/api.js';
import { ThemeProvider } from '@/components/theme-provider.js';

interface ApiResult {
  readonly status: number;
  readonly body: unknown;
}

const postJson = async (path: string, body: unknown): Promise<ApiResult> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getOrganizationHeaders()
    },
    body: JSON.stringify(body)
  });

  return { status: response.status, body: await response.json() };
};

const roleLabels: Record<UserDto['role'], string> = {
  player: 'Player',
  business_staff: 'Business staff',
  admin: 'Admin'
};

const organizationLabels: Record<string, string> = {
  fgl: 'FLI Golf',
  'org-2': 'Example School',
  'org-custom': 'Custom Demo League'
};

function ResultOutput({ result }: { result: ApiResult | undefined }) {
  if (result === undefined) {
    return null;
  }

  const succeeded = result.status < 300;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <Badge variant={succeeded ? 'default' : 'destructive'}>
        {succeeded ? 'Success' : 'Error'} · {result.status.toString()}
      </Badge>
      <pre
        className={
          succeeded
            ? 'overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground'
            : 'overflow-x-auto rounded-md bg-destructive/10 p-3 text-xs text-destructive'
        }
      >
        {JSON.stringify(result.body, null, 2)}
      </pre>
    </div>
  );
}

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

function OrganizationOverview({
  organizationId,
  currentUser,
  userCount,
  organization,
  setup
}: {
  readonly organizationId: string;
  readonly currentUser: UserDto | undefined;
  readonly userCount: number;
  readonly organization: OrganizationDto | undefined;
  readonly setup: OrganizationSetup | undefined;
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
      <CardHeader>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Organization
        </p>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <Building2 className="size-5" />
          </span>
          {organizationName}
          <Badge variant="outline">Active organization</Badge>
        </CardTitle>
        <CardDescription>
          The organization is the first boundary for your League and Business
          workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Organization ID</p>
          <p className="mt-1 font-medium">{organizationId}</p>
        </div>
        <div className="rounded-lg bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-medium">{currentUser?.name ?? 'Loading'}</p>
        </div>
        <div className="rounded-lg bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Organization users</p>
          <p className="mt-1 font-medium">{userCount.toString()}</p>
        </div>
      </CardContent>
      {(setup !== undefined || organization !== undefined) && (
        <CardContent className="border-t pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {setup?.templateName ?? 'Organization configuration'}
            </Badge>
            {(
              setup?.selectedComponents ??
              organization?.enabledComponents ??
              []
            ).map((componentId) => (
              <Badge key={componentId} variant="secondary">
                {selectedLabels.get(componentId) ?? componentId}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ReimbursementClaimForm({
  claimantId,
  onSubmitted
}: {
  claimantId: string;
  onSubmitted: () => void;
}) {
  const [departments, setDepartments] = useState<readonly DepartmentDto[]>([]);
  const [projects, setProjects] = useState<readonly ProjectDto[]>([]);
  const [departmentId, setDepartmentId] = useState('department-1');
  const [projectId, setProjectId] = useState('project-1');
  const [amount, setAmount] = useState('4250');
  const [description, setDescription] = useState('Court supplies');
  const [result, setResult] = useState<ApiResult | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchDepartments().then(setDepartments);
    void fetchProjects().then(setProjects);
  }, []);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await postJson('/business/reimbursement-claims', {
        claimantId,
        departmentId,
        projectId,
        items: [
          {
            description,
            amountMinorUnits: Number(amount),
            currency: 'USD'
          }
        ]
      });
      setResult(response);
      if (response.status < 300) {
        onSubmitted();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit reimbursement claim</CardTitle>
        <CardDescription>Business operations proof of concept</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>Claimant</Label>
            <p className="text-sm text-muted-foreground">{claimantId}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="claim-department">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="claim-department" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="claim-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="claim-project" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="claim-description">Description</Label>
            <Input
              id="claim-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="claim-amount">Amount (minor units)</Label>
            <Input
              id="claim-amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit claim'}
          </Button>
        </form>
        <ResultOutput result={result} />
      </CardContent>
    </Card>
  );
}

function TournamentRegistrationForm({
  lockedPlayer,
  onSubmitted
}: {
  lockedPlayer: PlayerDto | undefined;
  onSubmitted: () => void;
}) {
  const [players, setPlayers] = useState<readonly PlayerDto[]>([]);
  const [tournaments, setTournaments] = useState<readonly TournamentDto[]>([]);
  const [playerId, setPlayerId] = useState(lockedPlayer?.id ?? 'player-1');
  const [tournamentId, setTournamentId] = useState('tournament-1');
  const [result, setResult] = useState<ApiResult | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchPlayers().then(setPlayers);
    void fetchTournaments().then(setTournaments);
  }, []);

  useEffect(() => {
    if (lockedPlayer !== undefined) {
      setPlayerId(lockedPlayer.id);
    }
  }, [lockedPlayer]);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await postJson('/league/tournament-registrations', {
        playerId,
        tournamentId
      });
      setResult(response);
      if (response.status < 300) {
        onSubmitted();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register player for tournament</CardTitle>
        <CardDescription>League operations proof of concept</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="registration-player">Player</Label>
            {lockedPlayer === undefined ? (
              <Select value={playerId} onValueChange={setPlayerId}>
                <SelectTrigger id="registration-player" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.displayName}
                      {player.active ? '' : ' (inactive)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {lockedPlayer.displayName}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="registration-tournament">Tournament</Label>
            <Select value={tournamentId} onValueChange={setTournamentId}>
              <SelectTrigger id="registration-tournament" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register'}
          </Button>
        </form>
        <ResultOutput result={result} />
      </CardContent>
    </Card>
  );
}

export function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<readonly UserDto[]>([]);
  const [players, setPlayers] = useState<readonly PlayerDto[]>([]);
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
    void fetchPlayers().then(setPlayers);
    void Promise.all([fetchUsers(), seedDefaultOrganizations()]).then(
      ([fetchedUsers, seeded]) => {
        setUsers(fetchedUsers);
        setOrganizations(seeded);
        const savedOrganization = window.localStorage.getItem(
          'flihub-active-organization'
        );
        const nextOrganizationId =
          savedOrganization ??
          getOrganizationCatalog().find((organization) => organization.id === 'fgl')
            ?.id ??
          seeded[0].id;
        setActiveOrganization(nextOrganizationId);
        setSelectedOrganizationId(nextOrganizationId);
        const matchingUser = fetchedUsers.find(
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
  }, []);

  useEffect(() => {
    void fetchOrganization().then(setOrganization);
  }, [refreshKey]);

  const refreshDashboard = () => {
    setRefreshKey((key) => key + 1);
  };

  const currentUser = users.find((user) => user.id === currentUserId);
  const organizationId = selectedOrganizationId;
  const lockedPlayer =
    currentUser?.role === 'player'
      ? players.find((player) => player.id === currentUser.playerId)
      : undefined;

  const showReimbursementForm =
    currentUser?.role === 'business_staff' || currentUser?.role === 'admin';
  const showRegistrationForm =
    currentUser?.role === 'player' || currentUser?.role === 'admin';

  return (
    <ThemeProvider defaultTheme="dark" storageKey="flihub-ui-theme">
      <div className="min-h-screen bg-muted/40">
        <AppNavbar activeView={activeView} onViewChange={setActiveView} />
        <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
          {activeView === 'start-guide' ? (
            <StartGuide
              onRegistered={(setup) => {
                const customOrganization = registerCustomOrganization({
                  name: setup.organizationName,
                  enabledComponents: setup.selectedComponents
                });

                setOrganizations(getOrganizationCatalog());
                setOrganizationSetup(setup);
                setActiveOrganization(customOrganization.id);
                setSelectedOrganizationId(customOrganization.id);
                setActiveView('home');
              }}
            />
          ) : activeView === 'diagram' ? (
            <ObjectDiagram refreshKey={refreshKey} />
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
                    onChange={(nextOrganizationId) => {
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
                    }}
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
                userCount={
                  users.filter((user) => user.organizationId === organizationId)
                    .length
                }
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <div
                  key={currentUser?.organizationId}
                  className="flex flex-col gap-6"
                >
                  {showReimbursementForm && (
                    <ReimbursementClaimForm
                      claimantId={currentUser.id}
                      onSubmitted={refreshDashboard}
                    />
                  )}
                  {showRegistrationForm && (
                    <TournamentRegistrationForm
                      lockedPlayer={lockedPlayer}
                      onSubmitted={refreshDashboard}
                    />
                  )}
                  {!showReimbursementForm && !showRegistrationForm && (
                    <Card>
                      <CardHeader>
                        <CardTitle>No actions available</CardTitle>
                        <CardDescription>
                          Select a user above to see role-driven workflows.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </div>
                <Dashboard refreshKey={refreshKey} />
              </div>
            </>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
