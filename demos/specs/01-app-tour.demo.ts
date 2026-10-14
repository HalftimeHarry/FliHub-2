import { defineDemo } from '../lib/demo.js';

defineDemo({
  slug: '01-app-tour',
  title: 'App tour',
  steps: [
    {
      say: 'Welcome to FLIHub — one place to run your golf league, your business operations, and your community programs.',
      run: async ({ page, ui }) => {
        await ui.highlight(page.getByRole('navigation'), 2600);
      }
    },
    {
      say: 'The Organizations page is your community home. It shows the current season and every tournament on the schedule.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByRole('heading', {
            name: 'Summer golf, built for community.'
          }),
          2200
        );
        await ui.pause(1200);
        await ui.highlight(
          page
            .getByRole('heading', { name: 'Current season tournaments' })
            .first()
            .locator('../..'),
          2400
        );
      }
    },
    {
      say: 'Click any team badge to see its details.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'View details for Hyzer Heroes' })
        );
        await page.getByRole('dialog').waitFor();
      },
      pauseAfterMs: 1500
    },
    {
      say: 'Close it to return to the page.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('dialog').getByRole('button', { name: 'Close' })
        );
      }
    },
    {
      say: 'Admin is the operator workspace, where you manage seasons, players, tournaments, sponsors, and more.',
      run: async ({ ui }) => {
        await ui.nav('Admin');
      },
      pauseAfterMs: 1000
    },
    {
      say: 'Diagram maps the domain objects behind the app and shows how they relate.',
      run: async ({ ui }) => {
        await ui.nav('Diagram');
      },
      pauseAfterMs: 1000
    },
    {
      say: 'Pipelines run validated workflows, like registering a player for a tournament.',
      run: async ({ ui }) => {
        await ui.nav('Pipelines');
      },
      pauseAfterMs: 1000
    },
    {
      say: 'And Create Organization walks you through setting up a brand new FLIHub instance.',
      run: async ({ ui }) => {
        await ui.nav('Create Organization');
      },
      pauseAfterMs: 1000
    },
    {
      say: 'Use the theme toggle at any time to switch between light and dark mode.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'Switch to light mode' })
        );
        await ui.pause(1400);
        await ui.click(
          page.getByRole('button', { name: 'Switch to dark mode' })
        );
      }
    },
    {
      say: "That's the tour. Watch the other videos to learn each workflow step by step."
    }
  ]
});
