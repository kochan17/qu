import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface MiniExerciseParams {
  question?: string;
  hint?: string;
  answer?: string;
  pauseSeconds?: number;
  brandSuffix?: string;
}

export function generateMiniExerciseScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as MiniExerciseParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;
  const pauseSec = p.pauseSeconds ?? 5;
  const hintDelay = pauseSec;
  const answerDelay = Math.min(hintDelay + 7, input.durationSec - 4);

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">ミニ演習</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">一緒にやってみよう</h2>
  </div>
  <div style="margin-top:48px; display:flex; gap:48px; align-items:center">
    <div class="pause-circle ${sid}-pause">⏸</div>
    <div>
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; letter-spacing:.04em; text-transform:uppercase">問題</div>
      <div class="mono" style="font-size:72px; font-weight:800; line-height:1.1; margin-top:8px">
        ${p.question ?? ''}
      </div>
    </div>
  </div>
  <div class="${sid}-hint" style="opacity:0; margin-top:36px; padding:24px 28px; border-radius:22px; background:rgba(255,159,10,0.1); border:1px solid rgba(255,159,10,0.35); display:flex; gap:18px; align-items:center">
    <div style="padding:10px 16px; border-radius:14px; background:var(--orange); color:white; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; letter-spacing:.08em">HINT</div>
    <div class="mono" style="font-size:32px; font-weight:700; color:#7a4a00">${p.hint ?? ''}</div>
  </div>
  <div class="${sid}-answer" style="opacity:0; margin-top:auto; display:flex; gap:24px; align-items:center; align-self:center">
    <div class="ans-card">
      ${p.answer ?? ''}
    </div>
  </div>
</div>`;

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
tl.fromTo('#${sid} .${sid}-pause', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, ${t + 0.9});
tl.to('#${sid} .${sid}-pause', { scale: 1.06, duration: 0.6, repeat: 6, yoyo: true, ease: 'sine.inOut' }, ${t + 1.6});
tl.fromTo('#${sid} .${sid}-hint', { y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, ${t + hintDelay});
tl.fromTo('#${sid} .${sid}-answer', { y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, ${t + answerDelay});`;

  return { html, gsapJs, audioStart: input.startSec };
}
