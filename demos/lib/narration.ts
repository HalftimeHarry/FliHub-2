import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { probeDurationMs } from './ffmpeg.js';

export interface NarrationClip {
  readonly text: string;
  /** Path to the synthesized mp3, or undefined when narration is disabled. */
  readonly file: string | undefined;
  readonly durationMs: number;
}

const placeholderKeys = new Set(['', 'your_api_key_here']);
const cacheDir = path.resolve(import.meta.dirname, '..', '.cache', 'narration');

export const narrationSettings = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim() ?? '';
  const narrationOff = process.env.DEMO_NARRATION === 'off';
  return {
    enabled: !narrationOff && !placeholderKeys.has(apiKey),
    apiKey,
    // "George" — a stock ElevenLabs voice. Override with any voice ID from your account.
    voiceId: process.env.ELEVENLABS_VOICE_ID ?? 'JBFqnCBsd6RMkjVDRZzb',
    modelId: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2'
  };
};

/** Approximate speaking time so silent runs keep a natural pace for captions. */
const estimateSpeechMs = (text: string): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1500, Math.round((words / 2.6) * 1000) + 400);
};

const synthesize = async (
  settings: ReturnType<typeof narrationSettings>,
  text: string,
  context: { previous: string | undefined; next: string | undefined }
): Promise<string> => {
  const key = createHash('sha256')
    .update([settings.voiceId, settings.modelId, text].join('\u0000'))
    .digest('hex')
    .slice(0, 24);
  const file = path.join(cacheDir, `${key}.mp3`);
  if (existsSync(file)) {
    return file;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(settings.voiceId)}?output_format=mp3_44100_128`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': settings.apiKey,
      'content-type': 'application/json',
      accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text,
      model_id: settings.modelId,
      previous_text: context.previous,
      next_text: context.next,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    const hint =
      response.status === 401
        ? ' Check ELEVENLABS_API_KEY in .env.'
        : response.status === 404
          ? ' Check ELEVENLABS_VOICE_ID.'
          : '';
    throw new Error(
      `ElevenLabs TTS failed (${response.status.toString()}).${hint}\n${detail}`
    );
  }

  await mkdir(cacheDir, { recursive: true });
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  return file;
};

/**
 * Generates (or loads cached) narration for every line before recording starts,
 * so the browser never sits idle waiting on the TTS API mid-video.
 */
export const prepareNarration = async (
  lines: readonly string[]
): Promise<NarrationClip[]> => {
  const settings = narrationSettings();
  if (!settings.enabled) {
    return lines.map((text) => ({
      text,
      file: undefined,
      durationMs: estimateSpeechMs(text)
    }));
  }

  // Sequential on purpose: ElevenLabs plans cap concurrent requests.
  const clips: NarrationClip[] = [];
  for (const [index, text] of lines.entries()) {
    const file = await synthesize(settings, text, {
      previous: lines[index - 1],
      next: lines[index + 1]
    });
    clips.push({ text, file, durationMs: await probeDurationMs(file) });
  }
  return clips;
};
