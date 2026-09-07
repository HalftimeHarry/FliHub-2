import { ArrowDown, ArrowRight, CircleCheck, CircleDashed, Play, Workflow } from 'lucide-react';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { ObjectSelect } from '@/components/object-select.js';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.js';
import { Label } from '@/components/ui/label.js';
import {
  fetchPlayers,
  fetchTournaments,
  registerPlayerForTournament,
  type PlayerDto,
  type TournamentDto
} from '@/lib/api.js';

export function Pipelines() {
  const [players, setPlayers] = useState<readonly PlayerDto[]>([]);
  const [tournaments, setTournaments] = useState<readonly TournamentDto[]>([]);
  const [pipelineId, setPipelineId] = useState('tournament-registration');
  const [tournamentId, setTournamentId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState<string | undefined>(undefined);
  const selectedTournament = tournaments.find(
    (tournament) => tournament.id === tournamentId
  );
  const selectedPlayer = players.find((player) => player.id === playerId);
  const inputsReady = selectedTournament !== undefined && selectedPlayer !== undefined;

  useEffect(() => {
    void Promise.all([fetchPlayers(), fetchTournaments()]).then(
      ([nextPlayers, nextTournaments]) => {
        setPlayers(nextPlayers);
        setTournaments(nextTournaments);
      }
    );
  }, []);

  const run = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pipelineId !== 'tournament-registration') return;

    setRunning(true);
    setError(undefined);
    setCompleted(undefined);
    try {
      await registerPlayerForTournament({ tournamentId, playerId });
      setCompleted('Tournament registration completed.');
      setPlayerId('');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Pipeline execution failed.'
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-primary">Workflow execution</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pipelines</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Select one pipeline and the objects it requires, then run its domain workflow.
        </p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="size-5 text-violet-500" />
              Run a pipeline
            </CardTitle>
            <Badge variant="outline">Single-object inputs</Badge>
          </div>
          <CardDescription>
            Each input selects one domain object. The selected pipeline validates the full request before changing data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              void run(event);
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pipeline">Pipeline</Label>
                <ObjectSelect
                  id="pipeline"
                  value={pipelineId}
                  onValueChange={setPipelineId}
                  options={[{ id: 'tournament-registration', label: 'Tournament registration' }]}
                  placeholder="Select pipeline"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pipeline-tournament">Tournament</Label>
                <ObjectSelect
                  id="pipeline-tournament"
                  value={tournamentId}
                  onValueChange={setTournamentId}
                  options={tournaments.map((tournament) => ({
                    id: tournament.id,
                    label: tournament.name
                  }))}
                  placeholder="Select tournament"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pipeline-player">Player</Label>
                <ObjectSelect
                  id="pipeline-player"
                  value={playerId}
                  onValueChange={setPlayerId}
                  options={players
                    .filter((player) => player.active)
                    .map((player) => ({ id: player.id, label: player.displayName }))}
                  placeholder="Select player"
                />
              </div>
            </div>
            <section className="border-y py-5" aria-label="Pipeline execution diagram">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium">Execution path</h2>
                <Badge variant={inputsReady ? 'default' : 'outline'}>
                  {inputsReady ? 'Ready to run' : 'Awaiting inputs'}
                </Badge>
              </div>
              <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1 border border-sky-500/40 bg-sky-500/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">Tournament</p>
                    {selectedTournament === undefined ? (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    ) : (
                      <CircleCheck className="size-4 text-sky-600" />
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {selectedTournament?.name ?? 'Select one tournament'}
                  </p>
                </div>
                <ArrowDown className="mx-auto size-4 shrink-0 text-muted-foreground md:hidden" />
                <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                <div className="min-w-0 flex-1 border border-sky-500/40 bg-sky-500/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">Player</p>
                    {selectedPlayer === undefined ? (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    ) : (
                      <CircleCheck className="size-4 text-sky-600" />
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {selectedPlayer?.displayName ?? 'Select one active player'}
                  </p>
                </div>
                <ArrowDown className="mx-auto size-4 shrink-0 text-muted-foreground md:hidden" />
                <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                <div className="min-w-0 flex-1 border border-amber-500/40 bg-amber-500/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">Validate</p>
                    {inputsReady ? (
                      <CircleCheck className="size-4 text-amber-600" />
                    ) : (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Eligibility and tournament status
                  </p>
                </div>
                <ArrowDown className="mx-auto size-4 shrink-0 text-muted-foreground md:hidden" />
                <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                <div className="min-w-0 flex-1 border border-emerald-500/40 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">Registration</p>
                    {completed === undefined ? (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    ) : (
                      <CircleCheck className="size-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tournament registration created
                  </p>
                </div>
              </div>
            </section>
            <Button
              type="submit"
              className="self-start"
              disabled={tournamentId === '' || playerId === '' || running}
            >
              <Play />
              {running ? 'Running...' : 'Run pipeline'}
            </Button>
            {error !== undefined && <p className="text-sm text-destructive">{error}</p>}
            {completed !== undefined && (
              <p className="text-sm text-emerald-600 dark:text-emerald-300">
                {completed}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}