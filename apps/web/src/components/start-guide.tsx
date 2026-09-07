import {
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Code2,
  CircleOff,
  Database,
  Flag,
  Layers3,
  Sparkles,
  Trophy,
  Users,
  WalletCards
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { type OrganizationDto } from '@/lib/api.js';

export type TemplateId = 'fli-golf' | 'fli-basic' | 'custom';

export interface DepartmentSetup {
  readonly id: string;
  readonly name: string;
  readonly headName: string;
}

export interface OrganizationSetup {
  readonly organizationName: string;
  readonly template: TemplateId;
  readonly templateName: string;
  readonly selectedComponents: readonly string[];
  readonly departments: readonly DepartmentSetup[];
}

const seededDepartmentsByOrganization: Readonly<
  Record<string, readonly DepartmentSetup[]>
> = {
  fgl: [
    { id: 'operations', name: 'Operations', headName: 'Morgan Reyes' },
    { id: 'marketing', name: 'Marketing', headName: 'Taylor Morgan' },
    {
      id: 'player-development',
      name: 'Player Development',
      headName: 'Dakota Shaw'
    }
  ],
  'org-2': [
    {
      id: 'course-operations',
      name: 'Course Operations',
      headName: 'Riley Patel'
    }
  ],
  'org-custom': [
    { id: 'league-operations', name: 'League Operations', headName: '' },
    { id: 'event-operations', name: 'Event Operations', headName: '' }
  ]
};

interface ComponentOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: typeof Trophy;
  readonly tone: string;
}

export const componentOptions: readonly ComponentOption[] = [
  {
    id: 'league-operations',
    label: 'League operations',
    description: 'Leagues, seasons, tournaments, teams, and player rosters.',
    icon: Trophy,
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  },
  {
    id: 'fli-golf-format',
    label: 'FLI Golf format',
    description:
      'Nine physical holes played twice, two-pro teams, tee groups, and scorekeeper approval.',
    icon: Flag,
    tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Fantasy leagues, drafts, rosters, and fantasy standings.',
    icon: Sparkles,
    tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
  },
  {
    id: 'payouts',
    label: 'Payouts',
    description: 'Season purses, event payouts, and team payment workflows.',
    icon: CircleDollarSign,
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
  },
  {
    id: 'teams-and-rosters',
    label: 'Teams and rosters',
    description: 'Team membership, player eligibility, and reserve players.',
    icon: Users,
    tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
  },
  {
    id: 'courses-and-scoring',
    label: 'Courses and scoring',
    description:
      'Courses, holes, scorecards, scorekeeper approval, and standings.',
    icon: ClipboardCheck,
    tone: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
  },
  {
    id: 'sponsorship',
    label: 'Sponsorship',
    description: 'Sponsors, event placements, hole sponsors, and benefits.',
    icon: WalletCards,
    tone: 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
  },
  {
    id: 'community-content',
    label: 'Community content',
    description: 'Profiles, fan posts, media submissions, and moderation.',
    icon: Layers3,
    tone: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
  }
];

const templateDetails: Record<
  TemplateId,
  {
    readonly name: string;
    readonly description: string;
    readonly note: string;
    readonly selected: readonly string[];
    readonly badge: string;
    readonly tone: string;
    readonly setup: readonly string[];
    readonly bestFor: string;
    readonly highlights: readonly string[];
  }
> = {
  'fli-golf': {
    name: 'FLI Golf Format',
    description:
      'The complete FLI Golf starting point from the leagueDiagram prototype.',
    note: 'Includes the standard competition model: up to 12 teams, two-player teams, six tournaments, courses and holes, scorekeeper approval, standings, fantasy, and payouts.',
    selected: componentOptions.map((option) => option.id),
    badge: 'Complete standard',
    tone: 'border-emerald-500/50 bg-emerald-500/10',
    setup: [
      'Season purse and schedule',
      'Teams and professional rosters',
      'Courses, holes, groups, and scoring',
      'Fantasy, payouts, sponsorship, and community'
    ],
    bestFor: 'Professional FLI Golf operations',
    highlights: [
      'Create seasons with purses and tournament schedules.',
      'Run 12 mixed professional teams through six tee-group events.',
      'Use nine physical holes twice for an 18-hole FLI scoring round.',
      'Enable fantasy drafts, payouts, sponsors, and community content.'
    ]
  },
  'fli-basic': {
    name: 'FLI Basic',
    description:
      'A focused league setup for schools that need competition operations without fantasy or payouts.',
    note: 'Includes league operations, the FLI Golf format, teams and rosters, and courses and scoring. Fantasy and payout workflows stay off until you need them.',
    selected: [
      'league-operations',
      'fli-golf-format',
      'teams-and-rosters',
      'courses-and-scoring'
    ],
    badge: 'School-friendly',
    tone: 'border-sky-500/50 bg-sky-500/10',
    setup: [
      'Season schedule',
      'Teams and participant rosters',
      'Courses, holes, groups, and scoring',
      'Add commercial modules later'
    ],
    bestFor: 'School and regional competition operations',
    highlights: [
      'Create seasons, course layouts, and tournament schedules.',
      'Manage teams, participant eligibility, and tee groups.',
      'Run FLI nine-hole repeated rounds and scorekeeper approval.',
      'Keep fantasy, payouts, sponsorship, and community workflows disabled.'
    ]
  },
  custom: {
    name: 'Custom',
    description:
      'Start with FLI Basic, then shape the instance around your organization.',
    note: 'Add or remove components before registration. The selected components become your organization’s initial feature set.',
    selected: [
      'league-operations',
      'fli-golf-format',
      'teams-and-rosters',
      'courses-and-scoring'
    ],
    badge: 'Configurable',
    tone: 'border-violet-500/50 bg-violet-500/10',
    setup: [
      'Start with core League operations',
      'Choose enabled modules',
      'Configure teams and courses',
      'Expand the workspace as needed'
    ],
    bestFor: 'A tailored organization workspace',
    highlights: [
      'Start with the League operations required to run events.',
      'Choose commercial, fantasy, or community modules deliberately.',
      'Configure seasons, teams, courses, tournaments, and groups.',
      'Add advanced workflow capabilities as the operation grows.'
    ]
  }
};

const templateIcons: Record<TemplateId, typeof Trophy> = {
  'fli-golf': Trophy,
  'fli-basic': Flag,
  custom: Code2
};

export function StartGuide({
  onRegistered,
  organizations
}: {
  readonly onRegistered?: (setup: OrganizationSetup) => void;
  readonly organizations: readonly OrganizationDto[];
}) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<TemplateId>('custom');
  const [organizationName, setOrganizationName] = useState('Custom Demo League');
  const [selectedComponents, setSelectedComponents] = useState<
    readonly string[]
  >(templateDetails.custom.selected);
  const [departments, setDepartments] = useState<readonly DepartmentSetup[]>(
    seededDepartmentsByOrganization['org-custom']
  );
  const [registered, setRegistered] = useState(false);
  const [selectedSeedId, setSelectedSeedId] = useState<string | undefined>(
    'org-custom'
  );

  const details = templateDetails[template];
  const TemplateIcon = templateIcons[template];
  const componentLabels = new Map(
    componentOptions.map((component) => [component.id, component.label])
  );

  const steps = [
    { id: 0, label: 'Template' },
    { id: 1, label: 'Components' },
    { id: 2, label: 'Departments' },
    { id: 3, label: 'Review' }
  ] as const;

  const chooseTemplate = (nextTemplate: TemplateId) => {
    setTemplate(nextTemplate);
    setSelectedComponents(templateDetails[nextTemplate].selected);
    setRegistered(false);
  };

  const toggleComponent = (componentId: string) => {
    setSelectedComponents((current) =>
      current.includes(componentId)
        ? current.filter((id) => id !== componentId)
        : [...current, componentId]
    );
    setRegistered(false);
  };

  const addDepartment = () => {
    setDepartments((current) => [
      ...current,
      { id: `dept-${Date.now().toString(36)}`, name: '', headName: '' }
    ]);
  };

  const updateDepartment = (
    id: string,
    field: 'name' | 'headName',
    value: string
  ) => {
    setDepartments((current) =>
      current.map((department) =>
        department.id === id ? { ...department, [field]: value } : department
      )
    );
    setRegistered(false);
  };

  const removeDepartment = (id: string) => {
    setDepartments((current) =>
      current.filter((department) => department.id !== id)
    );
    setRegistered(false);
  };

  const selectSeededOrganization = (organization: OrganizationDto) => {
    const basicComponents = templateDetails['fli-basic'].selected;
    const nextTemplate: TemplateId =
      organization.enabledComponents.length === componentOptions.length
        ? 'fli-golf'
        : organization.enabledComponents.every((component) =>
              basicComponents.includes(component)
            ) &&
            organization.enabledComponents.length === basicComponents.length
          ? 'fli-basic'
          : 'custom';

    setSelectedSeedId(organization.id);
    setOrganizationName(organization.name);
    setTemplate(nextTemplate);
    setSelectedComponents(organization.enabledComponents);
    setDepartments(
      seededDepartmentsByOrganization[organization.id] ?? [
        { id: 'dept-1', name: '', headName: '' }
      ]
    );
    setStep(1);
    setRegistered(false);
  };

  const validDepartments = departments.filter(
    (department) => department.name.trim().length >= 2
  );

  const canContinue =
    step === 0
      ? organizationName.trim().length >= 2
      : step === 1
        ? selectedComponents.length > 0
        : true;

  const finishRegistration = () => {
    setRegistered(true);
    onRegistered?.({
      organizationName: organizationName.trim(),
      template,
      templateName: details.name,
      selectedComponents,
      departments: validDepartments
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Organization setup</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Start your FLIHub instance
        </h1>
        <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-3xl text-sm text-muted-foreground">
            Walk through the setup wizard: pick a starting format, choose
            components, define departments and their heads, then register.
          </p>
        </div>
      </div>

      {step === 0 && (
        <Card>
          <CardContent className="grid gap-5 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="organization-name">Organization name</Label>
              <Input
                id="organization-name"
                placeholder="Example School or FLI Golf"
                value={organizationName}
                onChange={(event) => {
                  setOrganizationName(event.target.value);
                  setRegistered(false);
                }}
              />
            </div>
            <div className="border-l-2 border-primary/40 pl-4">
              <p className="text-sm font-medium">Your operating sequence</p>
              <ol className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                <li>1. Create seasons and their purses.</li>
                <li>2. Add professional teams and courses.</li>
                <li>3. Schedule tournaments and tee groups.</li>
                <li>4. Assign scorekeepers and run scoring.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {organizations.length > 0 && (
        <Card className="border-violet-500/30 bg-violet-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-violet-600" />
              Default organizations ready
            </CardTitle>
            <CardDescription>
              These seeded organizations are available as starting examples.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {organizations.map((organization) => (
              <div
                key={organization.id}
                className={`border bg-background/60 p-4 transition-colors ${
                  selectedSeedId === organization.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : ''
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{organization.name}</p>
                      {selectedSeedId === organization.id && (
                        <Badge>Selected</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {organization.id} · {organization.type} organization ·{' '}
                      {organization.enabledComponents.length.toString()} components
                      {organization.paysTeams ? ' · team payouts enabled' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => {
                    selectSeededOrganization(organization);
                  }}
                >
                  <Check />
                  Use this organization
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((wizardStep, index) => (
          <li key={wizardStep.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStep(index);
              }}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                step === index
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-xs ${
                  step > index
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                {step > index ? <Check className="size-3" /> : index + 1}
              </span>
              {wizardStep.label}
            </button>
            {index < steps.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {(Object.keys(templateDetails) as TemplateId[]).map((templateId) => {
              const option = templateDetails[templateId];
              const Icon = templateIcons[templateId];
              const active = template === templateId;
              return (
                <button
                  key={templateId}
                  type="button"
                  className={`rounded-xl border p-5 text-left transition-colors hover:border-primary/60 ${
                    active ? option.tone : 'bg-card'
                  }`}
                  onClick={() => {
                    chooseTemplate(templateId);
                  }}
                  aria-pressed={active}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-background/70">
                      <Icon className="size-5" />
                    </span>
                    {active && <Badge>Selected</Badge>}
                  </div>
                  <h2 className="mt-5 font-semibold">{option.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  <p className="mt-4 text-xs font-medium text-foreground">
                    {option.bestFor}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                    {option.setup.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {active && (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-xs font-medium text-foreground">
                        Enabled modules
                      </p>
                      <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        {option.selected.map((componentId) => (
                          <li key={componentId} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked
                              readOnly
                              tabIndex={-1}
                              className="size-3.5 accent-emerald-600"
                            />
                            {componentLabels.get(componentId) ?? componentId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TemplateIcon className="size-5 text-primary" />
                  {details.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  {details.note}
                </CardDescription>
              </div>
              <Badge variant="outline">{details.badge}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="border-b pb-5">
              <h3 className="font-medium">What this setup includes</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {details.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Included components</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {template === 'custom'
                      ? 'Toggle components to shape your starting instance.'
                      : 'Included components are highlighted. Components marked Off are not enabled in this preset.'}
                  </p>
                </div>
                <Badge variant="outline">
                  {selectedComponents.length} selected
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {componentOptions.map((component) => {
                  const Icon = component.icon;
                  const selected = selectedComponents.includes(component.id);
                  return (
                    <label
                      key={component.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                        selected ? component.tone : 'bg-muted/30 opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={template !== 'custom'}
                        onChange={() => {
                          toggleComponent(component.id);
                        }}
                        className="mt-1 size-4 accent-current"
                      />
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background/70">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="flex flex-wrap items-center gap-2 font-medium">
                          {component.label}
                          <Badge
                            variant={selected ? 'default' : 'outline'}
                            className={selected ? 'bg-emerald-600' : ''}
                          >
                            {selected ? (
                              <>
                                <Check />
                                Included
                              </>
                            ) : (
                              <>
                                <CircleOff />
                                Off
                              </>
                            )}
                          </Badge>
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {component.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Departments &amp; heads
                </CardTitle>
                <CardDescription className="mt-2">
                  List the departments in your organization and who leads each.
                  These become the starting structure for your Business
                  workspace.
                </CardDescription>
              </div>
              <Badge variant="outline">
                {validDepartments.length} department
                {validDepartments.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {departments.map((department, index) => (
              <div
                key={department.id}
                className="grid gap-3 rounded-lg border bg-background/60 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`dept-name-${department.id}`}>
                    Department {index + 1}
                  </Label>
                  <Input
                    id={`dept-name-${department.id}`}
                    placeholder="e.g. Operations"
                    value={department.name}
                    onChange={(event) => {
                      updateDepartment(
                        department.id,
                        'name',
                        event.target.value
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`dept-head-${department.id}`}>Head</Label>
                  <Input
                    id={`dept-head-${department.id}`}
                    placeholder="e.g. Alex Rivera"
                    value={department.headName}
                    onChange={(event) => {
                      updateDepartment(
                        department.id,
                        'headName',
                        event.target.value
                      );
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={departments.length === 1}
                  onClick={() => {
                    removeDepartment(department.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={addDepartment}
            >
              + Add department
            </Button>
            <p className="text-sm text-muted-foreground">
              Departments need a name of at least two characters. Heads are
              optional but recommended for seeding realistic workflows.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="size-5 text-primary" />
              Review &amp; register
            </CardTitle>
            <CardDescription>
              Confirm the structure below, then register your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Organization</p>
                <p className="mt-1 font-medium">
                  {organizationName.trim() || '—'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Template</p>
                <p className="mt-1 font-medium">{details.name}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Components</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedComponents.map((componentId) => (
                  <Badge key={componentId} variant="secondary">
                    {componentOptions.find(
                      (option) => option.id === componentId
                    )?.label ?? componentId}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">
                Departments ({validDepartments.length})
              </h3>
              {validDepartments.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No departments defined yet. Go back to add some, or register
                  and add them later.
                </p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {validDepartments.map((department) => (
                    <li
                      key={department.id}
                      className="flex items-center justify-between rounded-lg border bg-background/60 px-4 py-2"
                    >
                      <span className="font-medium">{department.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {department.headName.trim() || 'No head assigned'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {registered && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                {organizationName.trim()} is registered with{' '}
                {selectedComponents.length} components and{' '}
                {validDepartments.length} departments.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col items-start justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {steps.length} · {steps[step].label}
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => {
              setStep((current) => Math.max(0, current - 1));
            }}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                setStep((current) =>
                  Math.min(steps.length - 1, current + 1)
                );
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              disabled={
                organizationName.trim().length < 2 ||
                selectedComponents.length === 0
              }
              onClick={finishRegistration}
            >
              <Check />
              Register organization
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
