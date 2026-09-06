import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppNavbar, type AppView } from '@/components/app-navbar.js';
import { Dashboard } from '@/components/dashboard.js';
import { Badge } from '@/components/ui/badge.js';
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
import { Label } from '@/components/ui/label.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.js';
import {
  createOrganizationAdmin,
  fetchOrganization,
  fetchUsers,
  getOrganizationCatalog,
  registerCustomOrganization,
  registerOrganizationDepartments,
  seedDefaultOrganizations,
  setActiveOrganization,
  setActiveUser,
  type OrganizationDto,
  type UserDto
} from '@/lib/api.js';
import { ThemeProvider } from '@/components/theme-provider.js';

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
      {setup !== undefined && setup.departments.length > 0 && (
        <CardContent className="border-t pt-0">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Departments
          </p>
          <ul className="flex flex-col gap-2">
            {setup.departments.map((department) => (
              <li
                key={department.id}
                className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-2"
              >
                <span className="font-medium">{department.name}</span>
                <span className="text-sm text-muted-foreground">
                  {department.headName.trim() || 'No head assigned'}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

export function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
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
              <Dashboard
                refreshKey={refreshKey}
                onDepartmentsChanged={refreshDashboard}
              />
            </>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
