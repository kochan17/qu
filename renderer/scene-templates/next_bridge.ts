import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface NextBridgeParams {
  eyebrow?: string;
  nextTitle?: string;
  nextSub?: string;
  footerPill?: string;
  brandSuffix?: string;
}

export function generateNextBridgeScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as NextBridgeParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? '次回'}</div>
    <h1 class="title ${sid}-title" style="margin-top:18px">${p.nextTitle ?? ''}</h1>
    <p class="subtitle ${sid}-sub">${p.nextSub ?? ''}</p>
    <div class="${sid}-pill" style="margin-top:48px; opacity:0; display:flex; align-items:center; gap:14px">
      <span class="pill"><span class="dot"></span>${p.footerPill ?? brand}</span>
    </div>
  </div>
</div>`;

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.2});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 24, duration: 0.6 }, ${t + 0.4});
tl.from('#${sid} .${sid}-sub', { opacity: 0, y: 14, duration: 0.5 }, ${t + 0.95});
tl.fromTo('#${sid} .${sid}-pill', { y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, ${t + 1.6});`;

  return { html, gsapJs, audioStart: input.startSec };
}
