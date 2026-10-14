import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from '@playwright/test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const envFile = path.join(repoRoot, '.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const baseURL = process.env.DEMO_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.demo.ts',
  outputDir: './.cache/test-results',
  // Videos are paced against narration, so run one at a time to keep timing smooth.
  workers: 1,
  fullyParallel: false,
  timeout: 5 * 60_000,
  reporter: [['list']],
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark',
    // Fail fast on a broken selector instead of hanging until the test timeout.
    actionTimeout: 15_000
  },
  webServer: {
    command: 'npm run dev',
    cwd: repoRoot,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
