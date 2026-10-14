import type { Page } from '@playwright/test';
import { defineDemo } from '../lib/demo.js';

const sidebarItem = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true }).last();

defineDemo({
  slug: '05-admin-workspace',
  title: 'Admin workspace',
  steps: [
    {
      say: 'The Admin view is your organization workspace. Open it from the top left.',
      run: async ({ ui }) => {
        await ui.nav('Admin');
      }
    },
    {
      say: "Choose the organization you're working in, and who you're viewing as. What you see depends on that user's role.",
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByText('Organization', { exact: true }).locator('..'),
          3000
        );
      }
    },
    {
      say: 'The dashboard groups tools into League, Business, Fantasy, and Workspace.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByText('Dashboard', { exact: true }).locator('../..'),
          2600
        );
      }
    },
    {
      say: 'Under League, you manage seasons, players, teams, tournaments, courses, and scoring.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'League', exact: true })
        );
        await ui.click(sidebarItem(page, 'Players'));
        await ui.pause(900);
        await ui.click(sidebarItem(page, 'Tournaments'));
      },
      pauseAfterMs: 1000
    },
    {
      say: 'Business covers sponsors and ticketing.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'Business', exact: true })
        );
        await ui.click(sidebarItem(page, 'Sponsors'));
      },
      pauseAfterMs: 1000
    },
    {
      say: 'Fantasy is where you run fantasy leagues and drafts.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'Fantasy', exact: true }).first()
        );
        await ui.click(sidebarItem(page, 'Drafts'));
      },
      pauseAfterMs: 1000
    },
    {
      say: 'And Workspace holds departments, projects, and reimbursement claims.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'Workspace', exact: true }).first()
        );
        await ui.click(sidebarItem(page, 'Departments'));
      },
      pauseAfterMs: 1200
    }
  ]
});
