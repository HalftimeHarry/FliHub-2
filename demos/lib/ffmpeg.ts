import { spawn } from 'node:child_process';
import ffmpegStatic from 'ffmpeg-static';

const ffmpegPath = process.env.FFMPEG_PATH ?? ffmpegStatic;

const runFfmpeg = (
  args: readonly string[]
): Promise<{ code: number; stderr: string }> =>
  new Promise((resolve, reject) => {
    if (ffmpegPath === null) {
      reject(
        new Error(
          'ffmpeg binary not found. Install ffmpeg-static or set FFMPEG_PATH.'
        )
      );
      return;
    }
    const child = spawn(ffmpegPath, ['-hide_banner', ...args]);
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code: code ?? 1, stderr });
    });
  });

export const probeDurationMs = async (file: string): Promise<number> => {
  // ffmpeg exits non-zero without an output file, but still prints the duration.
  const { stderr } = await runFfmpeg(['-i', file]);
  const match = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  if (match === null) {
    throw new Error(`Could not read duration of ${file}`);
  }
  const [, hours, minutes, seconds] = match;
  return Math.round(
    (Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)) * 1000
  );
};

export interface AudioPlacement {
  readonly file: string;
  readonly startMs: number;
}

export const renderVideo = async (options: {
  readonly video: string;
  readonly output: string;
  readonly trimStartMs: number;
  readonly audio: readonly AudioPlacement[];
}): Promise<void> => {
  const args: string[] = [
    '-y',
    '-ss',
    (options.trimStartMs / 1000).toFixed(3),
    '-i',
    options.video
  ];
  for (const clip of options.audio) {
    args.push('-i', clip.file);
  }

  if (options.audio.length > 0) {
    const delays = options.audio.map((clip, index) => {
      const delay = Math.max(0, Math.round(clip.startMs));
      return `[${(index + 1).toString()}:a]adelay=${delay.toString()}:all=1[a${index.toString()}]`;
    });
    const inputs = options.audio
      .map((_, index) => `[a${index.toString()}]`)
      .join('');
    const mix = `${inputs}amix=inputs=${options.audio.length.toString()}:normalize=0:dropout_transition=0,apad[aout]`;
    args.push(
      '-filter_complex',
      [...delays, mix].join(';'),
      '-map',
      '0:v',
      '-map',
      '[aout]',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest'
    );
  } else {
    args.push('-map', '0:v');
  }

  args.push(
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '20',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    options.output
  );

  const { code, stderr } = await runFfmpeg(args);
  if (code !== 0) {
    throw new Error(
      `ffmpeg failed (exit ${code.toString()}):\n${stderr.slice(-2000)}`
    );
  }
};
