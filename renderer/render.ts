import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createClient } from '@supabase/supabase-js';
import { buildHyperFramesProject } from './composition.js';
import type { CompositionSceneInput } from './composition.js';
import type { SceneType } from './scene-templates/index.js';

export interface RenderSceneInput {
  id: string;
  sceneType: SceneType;
  params: Record<string, unknown>;
  startSec: number;
  durationSec: number;
  audioFilePath: string;
  audioDurationS: number;
}

export interface RenderOptions {
  projectId: string;
  scenes: RenderSceneInput[];
  audioFiles: Record<string, string>;
  outDir: string;
  fps?: number;
  quality?: 'draft' | 'standard' | 'high';
}

export interface RenderResult {
  mp4Path: string;
  durationSec: number;
  sizeBytes: number;
}

const QUALITY_MAP: Record<'draft' | 'standard' | 'high', string> = {
  draft: 'draft',
  standard: 'standard',
  high: 'high',
};

const BUFFER_BY_TYPE: Partial<Record<SceneType, number>> = {
  worked_example_b2d: 3,
  worked_example_d2b: 3,
  counter_anim: 2,
  place_value_row: 2,
};

function inferDuration(scene: RenderSceneInput): number {
  if (scene.durationSec > 0) return scene.durationSec;
  const buffer = BUFFER_BY_TYPE[scene.sceneType] ?? 1;
  return Math.ceil(scene.audioDurationS + buffer);
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buf));
}

function generateSilenceMp3(durationSec: number, destPath: string): void {
  // Generate silent mp3 using ffmpeg
  const dur = Math.max(1, Math.ceil(durationSec));
  execSync(
    `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${dur} -q:a 9 -acodec libmp3lame "${destPath}" -y`,
    { stdio: 'pipe' }
  );
}

export async function renderProject(opts: RenderOptions): Promise<RenderResult> {
  const { projectId, scenes, audioFiles, outDir, fps = 30, quality = 'standard' } = opts;

  // 1. Create tmp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `que-render-${projectId}-`));
  const audioDir = path.join(tmpDir, 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  try {
    // 2. Resolve scene durations and build composition scenes
    const compositionScenes: CompositionSceneInput[] = scenes.map((scene, i) => {
      const num = String(i + 1).padStart(2, '0');
      const audioFileName = `scene-${num}.mp3`;
      const audioDestPath = path.join(audioDir, audioFileName);
      return {
        id: scene.id,
        sceneType: scene.sceneType,
        params: scene.params,
        startSec: scene.startSec,
        durationSec: inferDuration(scene),
        audioFilePath: audioDestPath,
        audioDurationS: scene.audioDurationS,
      };
    });

    // 3. Download or generate audio files
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const num = String(i + 1).padStart(2, '0');
      const audioDestPath = compositionScenes[i].audioFilePath;

      if (audioFiles[scene.id]) {
        const src = audioFiles[scene.id];
        if (src.startsWith('http://') || src.startsWith('https://')) {
          console.log(`  Downloading audio for scene ${num}...`);
          await downloadFile(src, audioDestPath);
        } else {
          // local path
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, audioDestPath);
          } else {
            console.warn(`  Audio file not found for scene ${num}, generating silence`);
            generateSilenceMp3(compositionScenes[i].durationSec, audioDestPath);
          }
        }
      } else {
        // Fallback: silent audio
        console.log(`  No audio for scene ${num}, generating ${compositionScenes[i].durationSec}s silence`);
        generateSilenceMp3(compositionScenes[i].durationSec, audioDestPath);
      }
    }

    // 4. Compute total duration from last scene end
    const totalDurationS = compositionScenes.reduce(
      (max, s) => Math.max(max, s.startSec + s.durationSec),
      0
    );

    // 5. Build HyperFrames HTML
    const { indexHtml } = buildHyperFramesProject({
      projectId,
      totalDurationS,
      scenes: compositionScenes,
    });

    fs.writeFileSync(path.join(tmpDir, 'index.html'), indexHtml, 'utf-8');

    // 6. Write minimal HF project files
    const metaJson = { id: projectId, name: projectId, createdAt: new Date().toISOString() };
    fs.writeFileSync(path.join(tmpDir, 'meta.json'), JSON.stringify(metaJson, null, 2), 'utf-8');

    const packageJson = {
      name: projectId,
      private: true,
      type: 'module',
      scripts: { render: 'npx --yes hyperframes@0.5.6 render' },
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8');

    const hyperframesJson = {
      '$schema': 'https://hyperframes.heygen.com/schema/hyperframes.json',
      registry: 'https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry',
      paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' },
    };
    fs.writeFileSync(path.join(tmpDir, 'hyperframes.json'), JSON.stringify(hyperframesJson, null, 2), 'utf-8');

    // 7. Run hyperframes render
    const outMp4 = path.join(tmpDir, 'out.mp4');
    const qualityFlag = QUALITY_MAP[quality];
    console.log(`  Running hyperframes render in ${tmpDir}...`);
    execSync(
      `npx --yes hyperframes@0.5.6 render -q ${qualityFlag} -f ${fps} -o out.mp4`,
      { cwd: tmpDir, stdio: 'inherit' }
    );

    if (!fs.existsSync(outMp4)) {
      throw new Error('hyperframes render did not produce out.mp4');
    }

    // 8. Copy to outDir
    fs.mkdirSync(outDir, { recursive: true });
    const destMp4 = path.join(outDir, `${projectId}.mp4`);
    fs.copyFileSync(outMp4, destMp4);

    const stat = fs.statSync(destMp4);

    return {
      mp4Path: destMp4,
      durationSec: totalDurationS,
      sizeBytes: stat.size,
    };
  } finally {
    // Cleanup tmp dir
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // best effort
    }
  }
}

// CLI mode: npx tsx render.ts <project_id>
async function cliMain(): Promise<void> {
  const projectId = process.argv[2];
  if (!projectId) {
    console.error('Usage: npx tsx render.ts <project_id>');
    process.exit(1);
  }

  const supabaseUrl = process.env['SUPABASE_URL'] ?? 'http://localhost:54321';
  const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'] ?? '';

  if (!supabaseKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY env var required');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Fetching project ${projectId}...`);

  const { data: project, error: projErr } = await supabase
    .from('lesson_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projErr || !project) {
    console.error('Project not found:', projErr?.message);
    process.exit(1);
  }

  const { data: scenesData, error: scenesErr } = await supabase
    .from('lesson_scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (scenesErr || !scenesData) {
    console.error('Failed to fetch scenes:', scenesErr?.message);
    process.exit(1);
  }

  // Compute cumulative start times
  let cursor = 0;
  const BUFFER_MAP: Record<string, number> = {
    worked_example_b2d: 3,
    worked_example_d2b: 3,
    counter_anim: 2,
    place_value_row: 2,
  };

  const scenes: RenderSceneInput[] = scenesData.map((scene: Record<string, unknown>) => {
    const audioDuration = typeof scene['audio_duration_s'] === 'number' ? scene['audio_duration_s'] : 0;
    const buffer = BUFFER_MAP[String(scene['scene_type'])] ?? 1;
    const durationSec = typeof scene['duration_s'] === 'number' && scene['duration_s'] > 0
      ? scene['duration_s']
      : Math.ceil(audioDuration + buffer);
    const startSec = cursor;
    cursor += durationSec;

    return {
      id: String(scene['id']),
      sceneType: String(scene['scene_type']) as SceneType,
      params: (typeof scene['params'] === 'object' && scene['params'] !== null ? scene['params'] : {}) as Record<string, unknown>,
      startSec,
      durationSec,
      audioFilePath: '',
      audioDurationS: audioDuration,
    };
  });

  // Get signed audio URLs
  const audioFiles: Record<string, string> = {};
  for (const scene of scenesData as Array<Record<string, unknown>>) {
    if (scene['audio_path']) {
      const { data: signedData } = await supabase.storage
        .from('lesson-audio')
        .createSignedUrl(String(scene['audio_path']), 3600);
      if (signedData?.signedUrl) {
        audioFiles[String(scene['id'])] = signedData.signedUrl;
      }
    }
  }

  const outDir = process.env['RENDER_OUT_DIR'] ?? '/tmp/que-renders';

  console.log(`Rendering ${scenes.length} scenes, total ${cursor}s...`);
  const result = await renderProject({ projectId, scenes, audioFiles, outDir, quality: 'draft' });

  console.log(`Done! mp4: ${result.mp4Path} (${(result.sizeBytes / 1024 / 1024).toFixed(1)} MB, ${result.durationSec}s)`);
}

// Detect CLI mode
if (process.argv[1] && (process.argv[1].endsWith('render.ts') || process.argv[1].endsWith('render.js'))) {
  cliMain().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
