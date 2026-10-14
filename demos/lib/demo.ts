import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test, type Locator, type Page } from '@playwright/test';
import { renderVideo } from './ffmpeg.js';
import { prepareNarration, type NarrationClip } from './narration.js';
import { installOverlay, type DemoOverlayApi } from './overlay.js';

export const outputDir = path.resolve(import.meta.dirname, '..', 'output');

export interface DemoUi {
  /** Move the visible cursor to an element and click it. */
  click(target: Locator): Promise<void>;
  /** Click a field and type into it at a human pace. */
  type(
    target: Locator,
    text: string,
    options?: { readonly clear?: boolean }
  ): Promise<void>;
  /** Open a Radix select (combobox) and choose an option by its visible label. */
  choose(trigger: Locator, option: string | RegExp): Promise<void>;
  /** Point at a native <select> and pick an option (native popups don't render in recordings). */
  selectNative(target: Locator, label: string): Promise<void>;
  /** Glide the cursor over an element without clicking. */
  hover(target: Locator): Promise<void>;
  /** Draw an attention box around an element. */
  highlight(target: Locator, durationMs?: number): Promise<void>;
  /** Smoothly scroll an element into the middle of the viewport. */
  scrollTo(target: Locator): Promise<void>;
  /** Click a top-level navigation item. */
  nav(
    name:
      | 'Admin'
      | 'Organizations'
      | 'Diagram'
      | 'Pipelines'
      | 'Create Organization'
  ): Promise<void>;
  pause(ms: number): Promise<void>;
}

export interface DemoContext {
  readonly page: Page;
  readonly ui: DemoUi;
}

export interface DemoStep {
  /** Narration for this step. Spoken (and captioned) while `run` executes. */
  readonly say: string;
  readonly run?: (ctx: DemoContext) => Promise<void>;
  /** Extra breathing room after narration ends. Defaults to 500ms. */
  readonly pauseAfterMs?: number;
}

export interface DemoDefinition {
  /** File name for the rendered video, e.g. `01-app-tour`. */
  readonly slug: string;
  readonly title: string;
  /** Mock user ID to sign in as (see apps/api/src/mock-users.ts). Defaults to the app's default user. */
  readonly asUser?: string;
  /** Skip recording with this reason, e.g. while the underlying feature is broken. */
  readonly skip?: string;
  /** Runs before recording is trimmed in, e.g. to navigate somewhere. Not narrated. */
  readonly setup?: (ctx: DemoContext) => Promise<void>;
  readonly steps: readonly DemoStep[];
}

const createUi = (page: Page): DemoUi => {
  const centerOf = async (target: Locator) => {
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (box === null)
      throw new Error(`Element is not visible: ${target.toString()}`);
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
  };

  const glideTo = async (target: Locator) => {
    const { x, y, box } = await centerOf(target);
    await page.mouse.move(x, y, { steps: 28 });
    await page.waitForTimeout(180);
    return box;
  };

  const ui: DemoUi = {
    async click(target) {
      await target.waitFor({ state: 'visible' });
      await glideTo(target);
      await target.click();
      await page.waitForTimeout(350);
    },
    async type(target, text, options) {
      await ui.click(target);
      if (options?.clear ?? true) await target.fill('');
      await target.pressSequentially(text, { delay: 55 });
      await page.waitForTimeout(250);
    },
    async choose(trigger, option) {
      await ui.click(trigger);
      const item = page.getByRole('option', { name: option }).first();
      await item.waitFor({ state: 'visible' });
      await glideTo(item);
      await item.click();
      await page.waitForTimeout(350);
    },
    async selectNative(target, label) {
      await glideTo(target);
      await target.selectOption({ label });
      await page.waitForTimeout(400);
    },
    async hover(target) {
      await target.waitFor({ state: 'visible' });
      await glideTo(target);
    },
    async highlight(target, durationMs = 1800) {
      await target.waitFor({ state: 'visible' });
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      if (box === null) return;
      await page.evaluate(
        ([rect, ms]) => {
          (window as unknown as { __demo: DemoOverlayApi }).__demo.highlight(
            rect,
            ms
          );
        },
        [box, durationMs] as const
      );
    },
    async scrollTo(target) {
      await target.waitFor({ state: 'attached' });
      await target.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await page.waitForTimeout(800);
    },
    async nav(name) {
      await ui.click(
        page.getByRole('navigation').getByRole('button', { name, exact: true })
      );
      // Views share one scroll container, so start each view at the top.
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(500);
    },
    async pause(ms) {
      await page.waitForTimeout(ms);
    }
  };
  return ui;
};

const setCaption = (page: Page, text: string | null) =>
  page.evaluate((value) => {
    (window as unknown as { __demo: DemoOverlayApi }).__demo.caption(value);
  }, text);

const srtTime = (ms: number) => {
  const clamped = Math.max(0, Math.round(ms));
  const h = Math.floor(clamped / 3_600_000);
  const m = Math.floor((clamped % 3_600_000) / 60_000);
  const s = Math.floor((clamped % 60_000) / 1000);
  const msPart = clamped % 1000;
  const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(msPart, 3)}`;
};

interface TimelineEntry {
  readonly clip: NarrationClip;
  readonly startMs: number;
  readonly endMs: number;
}

const toSrt = (timeline: readonly TimelineEntry[]) =>
  timeline
    .map(
      (entry, index) =>
        `${(index + 1).toString()}\n${srtTime(entry.startMs)} --> ${srtTime(entry.endMs)}\n${entry.clip.text}\n`
    )
    .join('\n');

/** Registers a Playwright test that records a narrated demo video. */
export const defineDemo = (demo: DemoDefinition): void => {
  test(
    demo.title,
    async (
      { browser, baseURL, viewport: configuredViewport, colorScheme },
      testInfo
    ) => {
      test.skip(demo.skip !== undefined, demo.skip);
      const clips = await prepareNarration(demo.steps.map((step) => step.say));
      const captions = process.env.DEMO_CAPTIONS !== 'off';

      const viewport = configuredViewport ?? { width: 1280, height: 720 };
      const context = await browser.newContext({
        ...(baseURL === undefined ? {} : { baseURL }),
        colorScheme,
        viewport,
        recordVideo: { dir: testInfo.outputPath('raw'), size: viewport }
      });
      await context.addInitScript(installOverlay, { captions });
      if (demo.asUser !== undefined) {
        await context.addInitScript((userId) => {
          localStorage.setItem('flihub-active-user', userId);
        }, demo.asUser);
      }

      const page = await context.newPage();
      const videoStartedAt = performance.now();
      const elapsed = () => performance.now() - videoStartedAt;
      const ui = createUi(page);
      const ctx: DemoContext = { page, ui };

      const timeline: TimelineEntry[] = [];
      let trimStartMs: number;
      try {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await demo.setup?.(ctx);
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        await page.waitForTimeout(400);
        trimStartMs = elapsed();

        for (const [index, step] of demo.steps.entries()) {
          const clip = clips[index];
          if (clip === undefined)
            throw new Error(`Missing narration for step ${index.toString()}`);
          const startedAt = elapsed();
          await setCaption(page, step.say);
          await step.run?.(ctx);
          const remaining = clip.durationMs - (elapsed() - startedAt);
          if (remaining > 0) await page.waitForTimeout(remaining);
          timeline.push({
            clip,
            startMs: startedAt - trimStartMs,
            endMs: elapsed() - trimStartMs
          });
          await page.waitForTimeout(step.pauseAfterMs ?? 500);
        }

        await setCaption(page, null);
        await page.waitForTimeout(1200);
      } finally {
        await context.close();
      }

      const video = page.video();
      if (video === null) throw new Error('Video recording was not enabled.');
      const rawVideo = await video.path();

      await mkdir(outputDir, { recursive: true });
      const output = path.join(outputDir, `${demo.slug}.mp4`);
      await renderVideo({
        video: rawVideo,
        output,
        trimStartMs,
        audio: timeline.flatMap((entry) =>
          entry.clip.file === undefined
            ? []
            : [{ file: entry.clip.file, startMs: entry.startMs }]
        )
      });
      const subtitles = path.join(outputDir, `${demo.slug}.srt`);
      await writeFile(subtitles, toSrt(timeline));

      await testInfo.attach('video', {
        path: output,
        contentType: 'video/mp4'
      });
      console.log(`  ✔ ${path.relative(process.cwd(), output)}`);
    }
  );
};
