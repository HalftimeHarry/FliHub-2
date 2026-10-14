# Demo videos

Narrated how-to videos of the FLIHub web app, recorded with Playwright and voiced with
[ElevenLabs](https://elevenlabs.io) text-to-speech.

Each demo is a list of steps. A step has a line of narration (`say`) and the UI actions
to perform while it's spoken (`run`). The harness:

1. Generates narration for every step up front and caches the mp3s in `demos/.cache/narration/`,
   so re-runs don't spend ElevenLabs credits.
2. Records the browser with a visible cursor, click ripples, highlight boxes, and captions.
3. Holds each step until its narration finishes, so the video and audio stay in sync.
4. Uses ffmpeg to mix the audio onto the video and writes `demos/output/<slug>.mp4` plus a matching `.srt`.

## Setup

```sh
npm install
npx playwright install --with-deps chromium
```

Put your key in `.env` at the repo root (gitignored):

```sh
ELEVENLABS_API_KEY=sk_...
```

## Recording

```sh
npm run demos                          # record all demos with narration
npm run demos -- specs/01-app-tour     # record one demo
npm run demos:silent                   # no audio; captions only, paced by estimated speech time
```

The config starts `npm run dev` automatically, or reuses a dev server already running on
port 5173. Set `DEMO_BASE_URL` to record against a different host.

| Variable              | Default                  | Purpose                                   |
| --------------------- | ------------------------ | ----------------------------------------- |
| `ELEVENLABS_API_KEY`  | —                        | Required for narration                    |
| `ELEVENLABS_VOICE_ID` | `JBFqnCBsd6RMkjVDRZzb`   | Any voice ID from your ElevenLabs account |
| `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` | ElevenLabs TTS model                      |
| `DEMO_NARRATION`      | on                       | `off` skips TTS                           |
| `DEMO_CAPTIONS`       | on                       | `off` hides burned-in captions            |
| `DEMO_BASE_URL`       | `http://localhost:5173`  | App URL to record                         |

## Demos

| Spec                             | Status                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `01-app-tour.demo.ts`            | ✅ Tour of every top-level view                                                                                                       |
| `02-create-organization.demo.ts` | ✅ Setup wizard: template → components → departments → register                                                                       |
| `03-run-pipeline.demo.ts`        | ⏸ Skipped: registering a player crashes the API (seeded registrations use strings, not `Identifier`s, in `apps/api/src/seed-data.ts`) |
| `04-create-league.demo.ts`       | ⏸ Skipped: `POST /fantasy/leagues` returns 404 because `apps/web/vite.config.ts` doesn't proxy `/fantasy`                             |
| `05-admin-workspace.demo.ts`     | ✅ Organization/user pickers and the League, Business, Fantasy, and Workspace sections                                                |

To re-enable a skipped demo after its bug is fixed, remove the `skip` line from its spec.

## Writing a demo

Add `specs/NN-name.demo.ts`:

```ts
import { defineDemo } from '../lib/demo.js';

defineDemo({
  slug: '06-my-feature',
  title: 'My feature',
  asUser: 'leader-1', // optional: mock user from apps/api/src/mock-users.ts
  steps: [
    {
      say: 'Open Pipelines from the top navigation.',
      run: async ({ ui }) => {
        await ui.nav('Pipelines');
      }
    },
    {
      say: 'Pick a tournament.',
      run: async ({ page, ui }) => {
        await ui.choose(
          page.locator('#pipeline-tournament'),
          'Summer Season • June 16 at Turf Paradise'
        );
      }
    }
  ]
});
```

`ui` helpers move the visible cursor before acting: `click`, `type`, `choose` (Radix select),
`selectNative` (`<select>`), `hover`, `highlight`, `scrollTo`, `nav`, and `pause`. The raw Playwright
`page` is available for assertions and anything else.

Tips:

- Keep each `say` to one or two sentences describing what's on screen during that step.
- Narration is cached by voice, model, and text, so editing a line only regenerates that line.
- Demos that write data hit the in-memory API. Restart `npm run dev` for a clean slate.
