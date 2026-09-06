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
import { seedDefaultOrganizations, type OrganizationDto } from '@/lib/api.js';

export type TemplateId = 'fli-golf' | 'fli-basic' | 'custom';

export interface OrganizationSetup {
  readonly organizationName: string;
  readonly template: TemplateId;
  readonly templateName: string;
  readonly selectedComponents: readonly string[];
}

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
      'The standard FLI Golf competition structure and scoring flow.',
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
  }
> = {
  'fli-golf': {
    name: 'FLI Golf Format',
    description:
      'The complete FLI Golf starting point from the leagueDiagram prototype.',
    note: 'Includes the standard competition model: up to 12 teams, two-player teams, six tournaments, courses and holes, scorekeeper approval, standings, fantasy, and payouts.',
    selected: componentOptions.map((option) => option.id),
    badge: 'Complete standard',
    tone: 'border-emerald-500/50 bg-emerald-500/10'
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
    tone: 'border-sky-500/50 bg-sky-500/10'
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
    tone: 'border-violet-500/50 bg-violet-500/10'
  }
};

const templateIcons: Record<TemplateId, typeof Trophy> = {
  'fli-golf': Trophy,
  'fli-basic': Flag,
  custom: Code2
};

export function StartGuide({
  onRegistered
}: {
  readonly onRegistered?: (setup: OrganizationSetup) => void;
}) {
  const [template, setTemplate] = useState<TemplateId>('fli-basic');
  const [organizationName, setOrganizationName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<
    readonly string[]
  >(templateDetails['fli-basic'].selected);
  const [registered, setRegistered] = useState(false);
  const [seededOrganizations, setSeededOrganizations] = useState<
    readonly OrganizationDto[]
  >([]);
  const [selectedSeedId, setSelectedSeedId] = useState<string | undefined>(
    undefined
  );
  const [seeding, setSeeding] = useState(false);

  const details = templateDetails[template];
  const TemplateIcon = templateIcons[template];

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

  const seedOrganizations = async () => {
    setSeeding(true);
    try {
      setSeededOrganizations(await seedDefaultOrganizations());
    } finally {
      setSeeding(false);
    }
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
    setRegistered(false);
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
            Choose a starting format, review the included components, and
            register your organization.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={seeding}
            onClick={() => {
              void seedOrganizations();
            }}
          >
            <Database />
            {seeding ? 'Seeding defaults…' : 'Seed default organizations'}
          </Button>
        </div>
      </div>

      {seededOrganizations.length > 0 && (
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
            {seededOrganizations.map((organization) => (
              <div
                key={organization.id}
                className={`rounded-lg border bg-background/60 p-4 transition-colors ${
                  selectedSeedId === organization.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{organization.name}</p>
                  {selectedSeedId === organization.id && (
                    <Badge>Selected</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {organization.id} ·{' '}
                  {organization.enabledComponents.length.toString()} components
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
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
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TemplateIcon className="size-5 text-primary" />
                {details.name}
              </CardTitle>
              <CardDescription className="mt-2">{details.note}</CardDescription>
            </div>
            <Badge variant="outline">{details.badge}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
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

          <div className="flex flex-col items-start justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              {selectedComponents.length === 0
                ? 'Select at least one component to continue.'
                : `${selectedComponents.length.toString()} components ready for registration.`}
            </p>
            <Button
              type="button"
              disabled={
                organizationName.trim().length < 2 ||
                selectedComponents.length === 0
              }
              onClick={() => {
                setRegistered(true);
                onRegistered?.({
                  organizationName: organizationName.trim(),
                  template,
                  templateName: details.name,
                  selectedComponents
                });
              }}
            >
              <Check />
              Register organization
            </Button>
          </div>
          {registered && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              {organizationName.trim()} is configured with{' '}
              {selectedComponents.length} components using the {details.name}{' '}
              starting point.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
