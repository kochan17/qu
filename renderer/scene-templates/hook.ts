import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface HookParams {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  brandSuffix?: string;
}

export function generateHookScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as HookParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:120px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? ''}</div>
    <h1 class="title ${sid}-title" style="margin-top:18px">${p.title ?? ''}</h1>
    <p class="subtitle ${sid}-sub">${p.subtitle ?? ''}</p>
  </div>
  <div class="${sid}-bulbs" style="display:flex; gap:36px; margin-top:120px; align-self:center">
    <div class="bulb off ${sid}-b" data-bit="0">0</div>
    <div class="bulb off ${sid}-b" data-bit="1">0</div>
    <div class="bulb off ${sid}-b" data-bit="2">0</div>
    <div class="bulb off ${sid}-b" data-bit="3">0</div>
  </div>
</div>`;

  const gsapJs = `
const ${sid}patterns = [[0,1,0,1],[1,0,1,0],[1,1,0,0],[0,0,1,1],[1,1,1,1]];
${sid}patterns.forEach((pat, i) => {
  const tt = ${t + 1.2} + i * 0.55;
  pat.forEach((v, idx) => {
    tl.call((el, val) => {
      if (!el) return;
      el.classList.toggle('on', val === 1);
      el.classList.toggle('off', val === 0);
      el.textContent = String(val);
    }, [document.querySelectorAll('#${sid} .${sid}-b')[idx], v], tt);
  });
});
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 14, duration: 0.5 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 30, duration: 0.7 }, ${t + 0.25});
tl.from('#${sid} .${sid}-sub', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.7});`;

  return { html, gsapJs, audioStart: input.startSec };
}
