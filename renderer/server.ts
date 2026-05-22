import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { renderProject } from './render.js';
import type { RenderSceneInput } from './render.js';
import type { SceneType } from './scene-templates/index.js';
import fs from 'node:fs';

const app = new Hono();

const RENDER_OUT_DIR = process.env['RENDER_OUT_DIR'] ?? '/tmp/que-renders';
const PORT = Number(process.env['PORT'] ?? 8787);
const CALLBACK_TOKEN = process.env['RENDER_CALLBACK_TOKEN'] ?? 'local-dev-token';

interface RenderRequestBody {
  projectId: string;
  scenes: Array<{
    id: string;
    sceneType: SceneType;
    params: Record<string, unknown>;
    startSec: number;
    durationSec: number;
    audioDurationS: number;
  }>;
  audioUrls: Record<string, string>;
  callbackUrl: string;
  callbackToken: string;
}

interface JobStatus {
  jobId: string;
  projectId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  error?: string;
  mp4Path?: string;
}

const jobs = new Map<string, JobStatus>();

function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

app.get('/health', (c) => c.json({ status: 'ok', jobs: jobs.size }));

app.post('/render', async (c) => {
  let body: RenderRequestBody;
  try {
    body = await c.req.json() as RenderRequestBody;
  } catch {
    return c.json({ error: 'invalid JSON body' }, 400);
  }

  const { projectId, scenes, audioUrls, callbackUrl, callbackToken } = body;
  if (!projectId || !scenes || !Array.isArray(scenes)) {
    return c.json({ error: 'projectId and scenes are required' }, 400);
  }

  const jobId = generateJobId();
  const job: JobStatus = { jobId, projectId, status: 'queued' };
  jobs.set(jobId, job);

  // Process in background
  setImmediate(async () => {
    job.status = 'running';

    const renderScenes: RenderSceneInput[] = scenes.map(s => ({
      id: s.id,
      sceneType: s.sceneType,
      params: s.params,
      startSec: s.startSec,
      durationSec: s.durationSec,
      audioFilePath: '',
      audioDurationS: s.audioDurationS,
    }));

    try {
      const result = await renderProject({
        projectId,
        scenes: renderScenes,
        audioFiles: audioUrls,
        outDir: RENDER_OUT_DIR,
        quality: 'draft',
      });

      job.status = 'succeeded';
      job.mp4Path = result.mp4Path;

      if (callbackUrl) {
        await postCallback(callbackUrl, callbackToken ?? CALLBACK_TOKEN, {
          jobId,
          status: 'succeeded',
          outputVideoPath: result.mp4Path,
          durationSec: result.durationSec,
          sizeBytes: result.sizeBytes,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      job.status = 'failed';
      job.error = message;
      console.error(`[${jobId}] render failed:`, message);

      if (callbackUrl) {
        await postCallback(callbackUrl, callbackToken ?? CALLBACK_TOKEN, {
          jobId,
          status: 'failed',
          error: message,
        });
      }
    }
  });

  return c.json({ jobId, status: 'queued' }, 202);
});

app.get('/jobs/:jobId', (c) => {
  const jobId = c.req.param('jobId');
  const job = jobs.get(jobId);
  if (!job) return c.json({ error: 'job not found' }, 404);
  return c.json(job);
});

async function postCallback(url: string, token: string, body: Record<string, unknown>): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': token,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('callback POST failed:', err);
  }
}

fs.mkdirSync(RENDER_OUT_DIR, { recursive: true });

console.log(`Que Render Worker starting on port ${PORT}...`);

serve({ fetch: app.fetch, port: PORT });
