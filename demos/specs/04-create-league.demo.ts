import { expect } from '@playwright/test';
import { defineDemo } from '../lib/demo.js';

defineDemo({
  slug: '04-create-league',
  title: 'Create a fantasy league',
  // Remove once apps/web/vite.config.ts proxies /fantasy to the API.
  skip: 'Create league returns 404: the Vite dev proxy has no /fantasy entry.',
  steps: [
    {
      say: 'From the Organizations page, anyone can start their own invite-only league.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByText('Create your own league').locator('..'),
          2600
        );
      }
    },
    {
      say: 'Give your league a name.',
      run: async ({ page, ui }) => {
        await ui.type(page.getByPlaceholder('League name'), 'Weekend Warriors');
      }
    },
    {
      say: 'Optionally, invite a teammate to join you.',
      run: async ({ page, ui }) => {
        await ui.selectNative(
          page.locator('#landing-page-invite'),
          'Kat Mertsch'
        );
      }
    },
    {
      say: 'Then click Create league.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'Create league' }).last()
        );
        await expect(
          page.getByText('League created successfully: Weekend Warriors')
        ).toBeVisible();
      }
    },
    {
      say: 'Your league is created, and the Leagues count updates right away.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByText('League created successfully: Weekend Warriors'),
          1800
        );
        await ui.pause(1400);
        await ui.highlight(
          page.getByRole('button', { name: /^Leagues\s*\d+$/ }),
          2000
        );
      }
    }
  ]
});
