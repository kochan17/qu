import { generateScene } from './scene-templates/index.js';
import type { SceneType } from './scene-templates/index.js';

export interface CompositionSceneInput {
  id: string;
  sceneType: SceneType;
  params: Record<string, unknown>;
  startSec: number;
  durationSec: number;
  audioFilePath: string;
  audioDurationS: number;
}

export interface CompositionInput {
  projectId: string;
  totalDurationS: number;
  scenes: CompositionSceneInput[];
}

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f7f7f8; }
:root {
  --ink-900: #0b0b0f; --ink-700: #37373d; --ink-500: #6e6e76;
  --ink-300: #c7c7cd; --ink-100: #ebebee; --line: #e5e5ea;
  --bg: #f7f7f8; --card: #ffffff; --blue: #0a84ff; --green: #30d158;
  --orange: #ff9f0a; --red: #ff453a; --purple: #bf5af2;
  --yellow-bg: #fff7cc; --yellow-glow: rgba(255, 200, 0, 0.55);
}
body { font-family: "Inter", "Noto Sans JP", -apple-system, "SF Pro Display", "Hiragino Sans", sans-serif; color: var(--ink-900); -webkit-font-smoothing: antialiased; }
.scene { position: absolute; inset: 0; padding: 88px 128px 120px; display: flex; flex-direction: column; background: var(--bg); }
.scene-num { position: absolute; top: 48px; right: 64px; font-size: 18px; color: var(--ink-300); letter-spacing: 0.18em; font-weight: 700; }
.brand { position: absolute; top: 48px; left: 64px; font-size: 18px; color: var(--ink-300); letter-spacing: 0.18em; font-weight: 700; }
.eyebrow { font-size: 24px; font-weight: 600; color: var(--blue); letter-spacing: 0.06em; text-transform: uppercase; }
.title { font-size: 96px; font-weight: 800; line-height: 1.04; letter-spacing: -0.025em; }
.title-md { font-size: 64px; font-weight: 800; line-height: 1.08; letter-spacing: -0.02em; }
.subtitle { font-size: 32px; color: var(--ink-500); margin-top: 18px; line-height: 1.45; }
.mono { font-family: "JetBrains Mono", monospace; font-feature-settings: "tnum"; }
.card { background: var(--card); border-radius: 28px; box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 14px 36px rgba(11,11,15,0.06); }
.pill { display: inline-flex; align-items: center; gap: 12px; padding: 12px 22px; border-radius: 999px; background: rgba(10,132,255,0.08); color: var(--blue); font-size: 24px; font-weight: 600; }
.pill .dot { width: 8px; height: 8px; border-radius: 999px; background: var(--blue); }
.bulb { width: 140px; height: 140px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 56px; font-weight: 800; font-family: "JetBrains Mono", monospace; border: 1px solid var(--line); }
.bulb.on { background: var(--yellow-bg); box-shadow: 0 0 60px var(--yellow-glow), inset 0 0 30px rgba(255,200,0,0.25); color: #7a5a00; border-color: rgba(255,200,0,0.6); }
.bulb.off { background: var(--ink-100); color: var(--ink-300); }
.step-row { display: grid; grid-template-columns: 80px 1fr 200px; align-items: center; gap: 28px; padding: 22px 28px; border-radius: 18px; background: var(--card); border: 1px solid var(--line); }
.step-num { width: 56px; height: 56px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: var(--ink-100); color: var(--ink-700); font-weight: 800; font-size: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.digit-card { padding: 36px; border-radius: 28px; background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 16px; }
.digit-card .label { font-size: 22px; font-weight: 700; color: var(--ink-500); letter-spacing: 0.04em; text-transform: uppercase; }
.digit-card .name { font-size: 44px; font-weight: 800; letter-spacing: -0.02em; }
.digit-card .digits { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.digit-chip { width: 52px; height: 52px; border-radius: 12px; background: var(--ink-100); color: var(--ink-700); display: inline-flex; align-items: center; justify-content: center; font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 22px; }
.digit-chip.accent-blue { background: rgba(10,132,255,0.1); color: var(--blue); }
.digit-chip.accent-purple { background: rgba(191,90,242,0.12); color: var(--purple); }
.digit-chip.accent-orange { background: rgba(255,159,10,0.14); color: #b86d00; }
.progress-bar { position: absolute; bottom: 48px; left: 128px; right: 128px; height: 4px; background: rgba(0,0,0,0.05); border-radius: 2px; overflow: hidden; }
.progress-bar > div { height: 100%; background: var(--ink-900); border-radius: 2px; transform-origin: left center; transform: scaleX(0); }
.place-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.place-cell { width: 120px; height: 120px; border-radius: 18px; background: var(--card); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-family: "JetBrains Mono", monospace; font-weight: 800; font-size: 48px; }
.place-label { font-size: 22px; font-weight: 700; color: var(--ink-500); }
.equals { font-family: "JetBrains Mono", monospace; font-weight: 800; }
.ans-card { padding: 28px 36px; border-radius: 22px; background: rgba(48,209,88,0.08); border: 1px solid rgba(48,209,88,0.3); color: #1d7a3a; font-family: "JetBrains Mono", monospace; font-weight: 800; font-size: 56px; display: inline-flex; align-items: center; gap: 18px; }
.table-row { display: grid; grid-template-columns: 60px 1.4fr 0.8fr 0.8fr; gap: 24px; padding: 18px 28px; align-items: center; border-bottom: 1px solid var(--line); font-family: "JetBrains Mono", monospace; font-size: 32px; font-weight: 700; }
.table-row.head { font-family: "Inter","Noto Sans JP",sans-serif; font-size: 22px; font-weight: 700; color: var(--ink-500); letter-spacing: 0.04em; text-transform: uppercase; background: var(--ink-100); border-bottom: none; }
.nibble-table { display: grid; grid-template-columns: repeat(4, auto); gap: 10px 30px; font-family: "JetBrains Mono", monospace; font-size: 22px; }
.nibble-table .b { color: var(--blue); font-weight: 700; }
.nibble-table .h { color: var(--purple); font-weight: 800; }
.nibble-table .d { color: var(--ink-500); }
.mistake { padding: 24px 28px; border-radius: 22px; background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 12px; }
.mistake .bad { color: var(--red); font-weight: 700; font-size: 26px; }
.mistake .good { color: var(--green); font-weight: 700; font-size: 26px; }
.mistake .label { font-size: 18px; color: var(--ink-500); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
.pause-circle { width: 110px; height: 110px; border-radius: 999px; background: var(--ink-900); color: white; display: flex; align-items: center; justify-content: center; font-size: 56px; }
.summary-row { display: grid; grid-template-columns: 56px 1fr; gap: 24px; align-items: center; padding: 22px 0; border-top: 1px solid var(--line); }
.summary-row:first-child { border-top: none; }
.summary-num { width: 48px; height: 48px; border-radius: 14px; background: var(--ink-900); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; font-family: "JetBrains Mono", monospace; }
.summary-text { font-size: 30px; font-weight: 600; color: var(--ink-700); line-height: 1.45; }
.summary-text b { color: var(--ink-900); font-weight: 800; }
.underline-blue { background: linear-gradient(transparent 62%, rgba(10,132,255,0.22) 62%); padding: 0 6px; }
.ans-line { font-family: "JetBrains Mono", monospace; font-size: 38px; font-weight: 700; color: var(--ink-900); }
.glow-num { font-family: "JetBrains Mono", monospace; font-size: 64px; font-weight: 800; }
`;

export function buildHyperFramesProject(input: CompositionInput): { indexHtml: string } {
  const { totalDurationS, scenes } = input;
  const total = scenes.length;

  const audioElements = scenes.map((scene, i) => {
    const trackIndex = 10;
    const num = String(i + 1).padStart(2, '0');
    // Use relative path from tmp project root
    const audioSrc = `audio/scene-${num}.mp3`;
    return `<audio id="audio-${num}" class="clip" data-start="${scene.startSec}" data-track-index="${trackIndex}" src="${audioSrc}" data-duration="${scene.audioDurationS}"></audio>`;
  }).join('\n      ');

  const sceneOutputs = scenes.map((scene, i) => {
    return generateScene({
      id: scene.id,
      sceneType: scene.sceneType,
      params: scene.params,
      startSec: scene.startSec,
      durationSec: scene.durationSec,
      totalScenes: total,
      index: i + 1,
    });
  });

  const sceneHtml = sceneOutputs.map(o => o.html).join('\n\n      ');
  const gsapScripts = sceneOutputs.map(o => o.gsapJs).join('\n\n      ');

  const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
${CSS}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${totalDurationS}"
      data-width="1920"
      data-height="1080"
    >
      <!-- AUDIO TRACKS -->
      ${audioElements}

      <!-- SCENES -->
      ${sceneHtml}

      <!-- Global progress bar -->
      <div class="progress-bar">
        <div id="prog"></div>
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      ${gsapScripts}

      // Global progress bar
      tl.fromTo('#prog', { scaleX: 0 }, { scaleX: 1, duration: ${totalDurationS}, ease: 'none' }, 0);

      window.__timelines['main'] = tl;
    </script>
  </body>
</html>`;

  return { indexHtml };
}
