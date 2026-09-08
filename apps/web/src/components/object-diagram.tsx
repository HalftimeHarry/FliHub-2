import {
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Boxes,
  Database,
  GitBranch,
  Info,
  Layers3,
  Sparkles,
  Trophy,
  Users,
  X,
  Workflow
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs.js';
import { fetchOrganizationUsers, type UserDto } from '@/lib/api.js';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card.js';

interface DiagramNodeProps {
  readonly name: string;
  readonly detail: string;
  readonly info: string;
  readonly properties?: readonly string[];
  readonly tone: 'core' | 'league' | 'business' | 'support';
}

const toneClasses: Record<DiagramNodeProps['tone'], string> = {
  core: 'border-sky-500/40 bg-sky-500/10',
  league: 'border-emerald-500/40 bg-emerald-500/10',
  business: 'border-amber-500/40 bg-amber-500/10',
  support: 'border-violet-500/40 bg-violet-500/10'
};

const defaultProperties: Record<string, readonly string[]> = {
  Organization: ['id', 'name', 'slug', 'type', 'paysTeams', 'status'],
  Identifier: ['value', 'entity type', 'validation rules'],
  Money: ['amountMinorUnits', 'currency'],
  UserProfile: ['id', 'displayName', 'email', 'roles', 'tags', 'bio'],
  LeagueMembership: ['userId', 'leagueId', 'role', 'joinedAt', 'status'],
  LeagueInvite: ['leagueId', 'userId', 'status', 'expiresAt', 'respondedAt'],
  League: ['id', 'organizationId', 'name', 'format', 'paysTeams'],
  Season: ['id', 'leagueId', 'name', 'startDate', 'endDate', 'status'],
  Tournament: [
    'id',
    'seasonId',
    'name',
    'type',
    'scoringHoleCount',
    'startDate',
    'registrationDeadline',
    'status'
  ],
  Player: [
    'id',
    'displayName',
    'organizationId',
    'playerType',
    'schoolId',
    'professionalSince',
    'active'
  ],
  TournamentRegistration: [
    'id',
    'tournamentId',
    'playerId',
    'registeredAt',
    'status'
  ],
  Department: ['id', 'organizationId', 'name', 'headId', 'budgetId'],
  Project: [
    'id',
    'departmentId',
    'name',
    'description',
    'projectBudgetId',
    'status',
    'startDate and dueDate'
  ],
  ReimbursementClaim: [
    'id',
    'claimantId',
    'departmentId',
    'projectId',
    'items',
    'total',
    'status'
  ],
  ExpenseItem: ['description', 'amount', 'currency'],
  DepartmentBudget: [
    'id',
    'departmentId',
    'fiscalPeriod',
    'allocatedAmount',
    'committedAmount',
    'spentAmount'
  ],
  ProjectBudget: [
    'id',
    'projectId',
    'allocatedAmount',
    'committedAmount',
    'spentAmount',
    'remainingAmount'
  ],
  Task: [
    'projectId',
    'name and description',
    'status',
    'priority',
    'assignedTo',
    'estimatedCost',
    'committedCost',
    'actualCost',
    'startDate and dueDate'
  ],
  BidRequest: [
    'id',
    'taskId',
    'title',
    'specifications',
    'postedBy',
    'responseDeadline',
    'status'
  ],
  Bid: [
    'id',
    'bidRequestId',
    'vendorId',
    'amount',
    'schedule',
    'terms',
    'status'
  ],
  DepartmentHead: ['userId', 'departmentId', 'role', 'permissions'],
  AdminApproval: [
    'id',
    'bidId',
    'reviewerId',
    'decision',
    'comments',
    'decidedAt'
  ],
  TaskExpense: [
    'id',
    'taskId',
    'description',
    'amount',
    'submittedBy',
    'incurredAt'
  ],
  Payment: [
    'id',
    'approvalId',
    'payeeId',
    'amount',
    'bankAccountId',
    'status',
    'processedAt'
  ],
  BankAccount: [
    'id',
    'organizationId',
    'institutionName',
    'accountName',
    'lastFourDigits',
    'active'
  ],
  Paid: ['settledAt', 'paymentReference', 'settlementStatus'],
  FantasyLeague: ['id', 'organizationId', 'name', 'format', 'status'],
  FantasyTeam: ['id', 'fantasyLeagueId', 'ownerId', 'roster', 'points'],
  FantasyScoring: ['id', 'fantasyLeagueId', 'rules', 'updatedAt'],
  CommunityProgram: ['id', 'organizationId', 'name', 'participants', 'status'],
  Sponsorship: ['id', 'organizationId', 'sponsorId', 'scope', 'tier', 'status'],
  SponsorshipProgram: ['id', 'organizationId', 'name', 'benefits', 'status'],
  ContentSubmission: [
    'id',
    'authorId',
    'text or media',
    'submittedAt',
    'status',
    'reviewedBy',
    'reviewedAt'
  ]
};

function DiagramNode({
  name,
  detail,
  info,
  properties,
  tone
}: DiagramNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const infoId = useId();
  const displayedProperties = properties ?? defaultProperties[name];

  return (
    <>
      <div
        className={`group relative rounded-lg border p-3 ${toneClasses[tone]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            className="text-left font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              setIsOpen(true);
            }}
            aria-haspopup="dialog"
          >
            {name}
          </button>
          <span className="relative shrink-0">
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              aria-label={`More information about ${name}`}
              aria-describedby={infoId}
            >
              <Info />
            </Button>
            <span
              id={infoId}
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 hidden w-64 rounded-md border bg-popover p-3 text-left text-xs font-normal text-popover-foreground shadow-md group-hover:block group-focus-within:block"
            >
              {info}
            </span>
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            className="w-full max-w-lg rounded-xl border bg-card p-6 text-card-foreground shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${infoId}-title`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Object details
                </p>
                <h2
                  id={`${infoId}-title`}
                  className="mt-1 text-xl font-semibold"
                >
                  {name}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label={`Close ${name} details`}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <X />
              </Button>
            </div>
            <p className="mt-5 text-sm font-medium">{detail}</p>
            <p className="mt-2 text-sm text-muted-foreground">{info}</p>
            {displayedProperties.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-medium">Properties</h3>
                <ul className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {displayedProperties.map((property) => (
                    <li
                      key={property}
                      className="rounded-md bg-muted px-3 py-2"
                    >
                      {property}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function FlowArrow({
  direction = 'down'
}: {
  readonly direction?: 'down' | 'right';
}) {
  return direction === 'right' ? (
    <ArrowRight
      className="hidden shrink-0 text-muted-foreground md:block"
      aria-hidden="true"
    />
  ) : (
    <ArrowDown className="shrink-0 text-muted-foreground" aria-hidden="true" />
  );
}

const roleLabels: Record<UserDto['role'], string> = {
  player: 'Player',
  business_staff: 'Business staff',
  admin: 'Admin'
};

function ObjectBrowserGroup({
  names,
  tone
}: {
  readonly names: readonly string[];
  readonly tone: DiagramNodeProps['tone'];
}) {
  return (
    <div className="grid gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-3">
      {names.map((name) => (
        <DiagramNode
          key={name}
          name={name}
          detail="select to inspect properties"
          info={`${name} is part of the FLIHub domain model. Select the object name to inspect its properties and relationships.`}
          tone={tone}
        />
      ))}
    </div>
  );
}

function ObjectBrowser() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Boxes className="size-5 text-violet-500" />
            Explore objects
          </CardTitle>
          <Badge variant="outline">Properties</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="core">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-6">
            <TabsTrigger
              value="core"
              className="bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 data-[state=active]:bg-sky-500 data-[state=active]:text-white dark:text-sky-300 dark:data-[state=active]:text-white"
            >
              <Layers3 />
              Core
            </TabsTrigger>
            <TabsTrigger
              value="league"
              className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:text-emerald-300 dark:data-[state=active]:text-white"
            >
              <Trophy />
              League
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:text-amber-300 dark:data-[state=active]:text-white"
            >
              <BriefcaseBusiness />
              Business
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 data-[state=active]:bg-cyan-500 data-[state=active]:text-white dark:text-cyan-300 dark:data-[state=active]:text-white"
            >
              <Users />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="operations"
              className="bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 data-[state=active]:bg-violet-500 data-[state=active]:text-white dark:text-violet-300 dark:data-[state=active]:text-white"
            >
              <GitBranch />
              Operations
            </TabsTrigger>
            <TabsTrigger
              value="extended"
              className="bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 data-[state=active]:bg-rose-500 data-[state=active]:text-white dark:text-rose-300 dark:data-[state=active]:text-white"
            >
              <Sparkles />
              Extended
            </TabsTrigger>
          </TabsList>
          <TabsContent value="core">
            <ObjectBrowserGroup
              names={['Organization', 'Identifier', 'Money']}
              tone="core"
            />
          </TabsContent>
          <TabsContent value="league">
            <ObjectBrowserGroup
              names={[
                'League',
                'Season',
                'Tournament',
                'Player',
                'TournamentRegistration'
              ]}
              tone="league"
            />
          </TabsContent>
          <TabsContent value="business">
            <ObjectBrowserGroup
              names={[
                'Department',
                'Project',
                'ReimbursementClaim',
                'ExpenseItem',
                'DepartmentBudget',
                'ProjectBudget',
                'Task',
                'TaskExpense'
              ]}
              tone="business"
            />
          </TabsContent>
          <TabsContent value="users">
            <ObjectBrowserGroup
              names={['UserProfile', 'LeagueMembership', 'LeagueInvite']}
              tone="support"
            />
          </TabsContent>
          <TabsContent value="operations">
            <ObjectBrowserGroup
              names={[
                'BidRequest',
                'Bid',
                'DepartmentHead',
                'AdminApproval',
                'Payment',
                'BankAccount',
                'Paid'
              ]}
              tone="support"
            />
          </TabsContent>
          <TabsContent value="extended">
            <ObjectBrowserGroup
              names={[
                'FantasyLeague',
                'FantasyTeam',
                'FantasyScoring',
                'CommunityProgram',
                'Sponsorship',
                'SponsorshipProgram',
                'ContentSubmission'
              ]}
              tone="support"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
export function ObjectDiagram({ refreshKey }: { readonly refreshKey: number }) {
  const [users, setUsers] = useState<readonly UserDto[]>([]);

  useEffect(() => {
    void fetchOrganizationUsers().then(setUsers);
  }, [refreshKey]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Platform map</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Objects and relationships
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The current proof-of-concept model, grouped by shared Core concepts
          and domain boundary.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Boxes className="size-5 text-sky-500" />
              Shared foundation
            </CardTitle>
            <Badge variant="outline">Core</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="objects">
            <TabsList className="gap-1">
              <TabsTrigger value="objects">
                <Boxes />
                Core objects
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users />
                Users
              </TabsTrigger>
            </TabsList>
            <TabsContent value="objects">
              <div className="grid gap-3 pt-3 sm:grid-cols-3">
                <DiagramNode
                  name="Organization"
                  detail="Tenant boundary"
                  info="The top-level tenant boundary shared by League and Business. It keeps each operation's data isolated."
                  tone="core"
                />
                <DiagramNode
                  name="Identifier"
                  detail="Typed identity"
                  info="A validated identity value used by domain objects instead of passing unvalidated strings through the model."
                  tone="core"
                />
                <DiagramNode
                  name="Money"
                  detail="Currency-safe value"
                  info="Represents an amount together with its currency and supports safe arithmetic for financial values."
                  tone="core"
                />
              </div>
            </TabsContent>
            <TabsContent value="users">
              <div className="grid gap-3 pt-3 md:grid-cols-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {user.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.id}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{roleLabels[user.role]}</Badge>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No users found for this organization.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ObjectBrowser />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>League domain</CardTitle>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                League
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-stretch gap-2">
              <DiagramNode
                name="Organization"
                detail="owns the league"
                info="An Organization is the shared tenant boundary. A League belongs to one Organization so its seasons, tournaments, players, and registrations remain scoped to that operation."
                tone="core"
              />
              <FlowArrow />
              <DiagramNode
                name="League"
                detail="sports operation"
                info="A League represents a sports operation owned by an Organization. It is the parent for the competition seasons it manages."
                tone="league"
              />
              <FlowArrow />
              <DiagramNode
                name="Season"
                detail="time-bounded competition"
                info="A Season groups competitions within a defined period of a League's operation."
                tone="league"
              />
              <FlowArrow />
              <DiagramNode
                name="Tournament"
                detail="registration container"
                info="A Tournament is a competition within a Season. Players register against this object before participating."
                tone="league"
              />
              <FlowArrow />
              <div className="grid gap-2 sm:grid-cols-2">
                <DiagramNode
                  name="Player"
                  detail="participant"
                  info="A Player is the participant who can be registered for a Tournament."
                  tone="league"
                />
                <DiagramNode
                  name="TournamentRegistration"
                  detail="joins player to tournament"
                  info="A TournamentRegistration records the relationship between one Player and one Tournament."
                  tone="league"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Business domain</CardTitle>
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                Business
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-stretch gap-2">
              <DiagramNode
                name="Organization"
                detail="owns the department"
                info="An Organization owns the departments that coordinate its internal business operations."
                tone="core"
              />
              <FlowArrow />
              <DiagramNode
                name="Department"
                detail="operating unit"
                info="A Department is an organizational unit that owns or coordinates related projects."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="Project"
                detail="department initiative"
                info="A Project is an initiative associated with a Department and provides business context for expenses."
                properties={[
                  'id',
                  'departmentId',
                  'name',
                  'description',
                  'projectBudgetId',
                  'status',
                  'startDate and dueDate'
                ]}
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="ReimbursementClaim"
                detail="submitted business workflow"
                info="A ReimbursementClaim collects expense items submitted by a claimant and tracks the reimbursement status."
                tone="business"
              />
              <FlowArrow />
              <div className="grid gap-2 sm:grid-cols-2">
                <DiagramNode
                  name="ExpenseItem"
                  detail="line item"
                  info="An ExpenseItem describes one reimbursable purchase and contributes an amount to the claim total."
                  tone="business"
                />
                <DiagramNode
                  name="Money"
                  detail="claim total"
                  info="Money aggregates the claim's expense items while preserving the currency of the total."
                  tone="core"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Business operations</CardTitle>
            <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300">
              Planned flow
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col items-stretch gap-2">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Planning and budgets
              </p>
              <DiagramNode
                name="Department"
                detail="budget owner"
                info="A Department owns an annual or operational budget that limits the work it can authorize."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="DepartmentBudget"
                detail="department spending limit"
                info="A DepartmentBudget tracks the approved allocation and committed spending for a Department."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="Project"
                detail="funded initiative"
                info="A Project receives a budget from its Department and groups the tasks needed to deliver an initiative."
                properties={[
                  'id',
                  'departmentId',
                  'name',
                  'description',
                  'projectBudgetId',
                  'status',
                  'startDate and dueDate'
                ]}
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="ProjectBudget"
                detail="project spending limit"
                info="A ProjectBudget tracks the amount allocated to a Project and the amount committed by its tasks and purchases."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="Task"
                detail="planned unit of work"
                info="A Task belongs to a Project, has a status and expected cost, and can collect expenses against the project budget."
                properties={[
                  'projectId',
                  'name and description',
                  'status',
                  'priority',
                  'assignedTo',
                  'estimatedCost',
                  'committedCost',
                  'actualCost',
                  'startDate and dueDate'
                ]}
                tone="business"
              />
            </div>

            <div className="flex flex-col items-stretch gap-2">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Procurement
              </p>
              <DiagramNode
                name="BidRequest"
                detail="specifications and invitation"
                info="A BidRequest captures the scope and specifications for work such as building a course fence, then invites vendors to respond."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="Bid"
                detail="vendor proposal"
                info="A Bid is a vendor response to a BidRequest, including proposed work, price, schedule, and terms for comparison."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="DepartmentHead"
                detail="posts and recommends"
                info="A DepartmentHead prepares the specifications, posts the BidRequest, evaluates responses, and recommends a bid for approval."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="AdminApproval"
                detail="authorization gate"
                info="AdminApproval records the administrative decision before an accepted bid can create a payable commitment."
                tone="support"
              />
            </div>

            <div className="flex flex-col items-stretch gap-2">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Payment pipeline
              </p>
              <DiagramNode
                name="TaskExpense"
                detail="expense against task"
                info="A TaskExpense links a real cost to a Task and rolls that cost up into the ProjectBudget and DepartmentBudget."
                tone="business"
              />
              <FlowArrow />
              <DiagramNode
                name="Payment"
                detail="approved payable"
                info="A Payment is created after approval, moves through payment processing, and records the amount and recipient to be paid."
                tone="support"
              />
              <FlowArrow />
              <DiagramNode
                name="BankAccount"
                detail="funding source"
                info="A BankAccount is one of the organization's configured funding sources selected to settle an approved Payment."
                tone="core"
              />
              <FlowArrow />
              <DiagramNode
                name="Paid"
                detail="settled payment"
                info="Paid is the terminal payment state after the bank transfer or other settlement method succeeds."
                tone="support"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="flex gap-3">
            <Workflow className="mt-0.5 size-5 shrink-0 text-violet-500" />
            <div>
              <p className="font-medium">Workflows</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Registration and reimbursement workflows validate inputs, then
                create domain objects.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Database className="mt-0.5 size-5 shrink-0 text-violet-500" />
            <div>
              <p className="font-medium">Persistence</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Repository interfaces keep storage adapters separate from the
                domain model.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
