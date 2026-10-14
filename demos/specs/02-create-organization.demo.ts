import { defineDemo } from '../lib/demo.js';

defineDemo({
  slug: '02-create-organization',
  title: 'Create an organization',
  steps: [
    {
      say: "Let's set up a new organization. Open Create Organization from the top navigation.",
      run: async ({ ui }) => {
        await ui.nav('Create Organization');
      }
    },
    {
      say: 'You can start from one of the default organizations, or build your own. Open the Template step to begin from scratch.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page.getByText('Default organizations ready').locator('../../..'),
          2000
        );
        await ui.pause(1600);
        await ui.click(
          page.getByRole('listitem').getByRole('button', { name: 'Template' })
        );
      }
    },
    {
      say: 'Each template turns on a different set of modules. Choose Custom to pick exactly what you need.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.locator('button[aria-pressed]').filter({ hasText: 'Custom' })
        );
      }
    },
    {
      say: 'Give your organization a name, then continue.',
      run: async ({ page, ui }) => {
        await ui.type(
          page.getByLabel('Organization name'),
          'Riverside Disc Club'
        );
        await ui.click(page.getByRole('button', { name: 'Continue' }));
      }
    },
    {
      say: "On the Components step, check or uncheck modules to shape your starting feature set. Let's add Sponsorship.",
      run: async ({ page, ui }) => {
        const sponsorship = page
          .locator('label')
          .filter({ hasText: 'Sponsorship' })
          .first();
        await ui.scrollTo(sponsorship);
        await ui.click(sponsorship);
      }
    },
    {
      say: 'Next, list your departments and who leads each one.',
      run: async ({ page, ui }) => {
        await ui.click(page.getByRole('button', { name: 'Continue' }));
        await page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await ui.click(page.getByRole('button', { name: '+ Add department' }));
        await ui.type(page.locator('input[id^="dept-name-"]').last(), 'Events');
        await ui.type(
          page.locator('input[id^="dept-head-"]').last(),
          'Jordan Lee'
        );
      }
    },
    {
      say: 'Continue to Review to confirm your template, components, and departments.',
      run: async ({ page, ui }) => {
        await ui.click(page.getByRole('button', { name: 'Continue' }));
        await ui.highlight(
          page.getByText('Review & register').locator('../..'),
          2400
        );
      }
    },
    {
      say: 'When everything looks right, click Register organization.',
      run: async ({ page, ui }) => {
        await ui.click(
          page.getByRole('button', { name: 'Register organization' })
        );
        await page
          .getByRole('heading', { name: 'Organization workspace' })
          .waitFor();
      }
    },
    {
      say: 'FLIHub creates the organization, adds an admin user, and opens its workspace, ready for you to configure.',
      run: async ({ page, ui }) => {
        await ui.highlight(
          page
            .getByText('Riverside Disc Club', { exact: true })
            .first()
            .locator('../..'),
          2600
        );
      }
    }
  ]
});
