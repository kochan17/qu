import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface CardParams {
  label?: string;
  bigText?: string;
  desc?: string;
  color?: string;
}

interface WhyMattersParams {
  eyebrow?: string;
  title?: string;
  leftCard?: CardParams;
  rightCard?: CardParams;
  footerPill?: string;
  brandSuffix?: string;
}

export function generateWhyMattersScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as WhyMattersParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;
  const lc = p.leftCard ?? {};
  const rc = p.rightCard ?? {};

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? 'なぜ 学ぶ?'}</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">${p.title ?? 'この 1 本でできるようになること'}</h2>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:36px; margin-top:60px">
    <div class="card ${sid}-card1" style="padding:48px">
      <div style="font-size:22px; font-weight:700; color:${lc.color ?? 'var(--blue)'}; letter-spacing:.04em; text-transform:uppercase">${lc.label ?? ''}</div>
      <div style="font-size:64px; font-weight:800; margin-top:12px; letter-spacing:-0.02em">${lc.bigText ?? ''}</div>
      <div style="font-size:26px; color:var(--ink-500); margin-top:8px; line-height:1.5">${lc.desc ?? ''}</div>
    </div>
    <div class="card ${sid}-card2" style="padding:48px">
      <div style="font-size:22px; font-weight:700; color:${rc.color ?? 'var(--purple)'}; letter-spacing:.04em; text-transform:uppercase">${rc.label ?? ''}</div>
      <div style="font-size:64px; font-weight:800; margin-top:12px; letter-spacing:-0.02em">${rc.bigText ?? ''}</div>
      <div style="font-size:26px; color:var(--ink-500); margin-top:8px; line-height:1.5">${rc.desc ?? ''}</div>
    </div>
  </div>
  <div style="margin-top:auto; align-self:center" class="${sid}-pill">
    <span class="pill"><span class="dot"></span>${p.footerPill ?? ''}</span>
  </div>
</div>`;

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
tl.from('#${sid} .${sid}-card1', { opacity: 0, y: 24, duration: 0.55 }, ${t + 0.7});
tl.from('#${sid} .${sid}-card2', { opacity: 0, y: 24, duration: 0.55 }, ${t + 0.95});
tl.from('#${sid} .${sid}-pill', { opacity: 0, y: 14, duration: 0.5 }, ${t + 1.6});`;

  return { html, gsapJs, audioStart: input.startSec };
}
