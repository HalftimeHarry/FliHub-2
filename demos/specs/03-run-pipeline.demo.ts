import { expect } from '@playwright/test';
import { defineDemo } from '../lib/demo.js';

const tournament = 'Summer Season • June 16 at Turf Paradise';

defineDemo({
  slug: '03-run-pipeline',
  title: 'Register a player with a pipeline',
  // Registering another player needs the tournaments:register permission (leader role).
  asUser: 'leader-1',
  // Remove once seeded registrations in apps/api/src/seed-data.ts use Identifier objects.
  skip: 'Registering crashes the API: seeded TournamentRegistrations pass strings instead of Identifiers.',
  steps: [
    {
      say: 'Pipelines run a domain workflow from start to finish. Open Pipelines from the top navigation.',
      run: async ({ ui }) => {
        await ui.nav('Pipelines');
      }
    },
    {
      say: 'Tournament registration is already selected. First, choose the tournament.',
      run: async ({ page, ui }) => {
        await ui.choose(page.locator('#pipeline-tournament'), tournament);
      }
    },
    {
      say: 'Then pick the player to register. The execution path checks off each input as you go.',
      run: async ({ page, ui }) => {
        // The API keeps registrations in memory, so pick someone not yet registered
        // to keep this demo repeatable.
        const api = async <T>(path: string): Promise<T> => {
          const response = await page.request.get(path, {
            headers: { 'x-user-id': 'simon-lizotte' }
          });
          return (await response.json()) as T;
        };
        const [registrations, players, tournaments] = await Promise.all([
          api<
            readonly {
              readonly playerId: string;
              readonly tournamentId: string;
            }[]
          >('/league/tournament-registrations'),
          api<readonly { readonly id: string; readonly displayName: string }[]>(
            '/league/players'
          ),
          api<readonly { readonly id: string; readonly name: string }[]>(
            '/league/tournaments'
          )
        ]);
        const tournamentId = tournaments.find(
          (entry) => entry.name === tournament
        )?.id;
        const taken = new Set(
          registrations
            .filter((entry) => entry.tournamentId === tournamentId)
            .map((entry) => entry.playerId)
        );

        await ui.click(page.locator('#pipeline-player'));
        const options = page.getByRole('option');
        await options.first().waitFor();
        const labels = await options.allInnerTexts();
        const available = labels.find((label) => {
          const player = players.find(
            (entry) => entry.displayName === label.trim()
          );
          return player !== undefined && !taken.has(player.id);
        });
        if (available === undefined)
          throw new Error(
            'Every player is already registered for this tournament.'
          );
        const option = options.filter({ hasText: available.trim() }).first();
        await ui.hover(option);
        await option.click();
        await ui.pause(400);
        await ui.highlight(
          page.getByRole('region', { name: 'Pipeline execution diagram' }),
          2200
        );
      }
    },
    {
      say: 'With both inputs set, the pipeline is ready. Click Run pipeline.',
      run: async ({ page, ui }) => {
        await ui.click(page.getByRole('button', { name: 'Run pipeline' }));
        await expect(
          page.getByText('Tournament registration completed.')
        ).toBeVisible();
      }
    },
    {
      say: 'The pipeline validates eligibility and the tournament status, then creates the registration.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByText('Tournament registration completed.'),
          2600
        );
      }
    }
  ]
});
