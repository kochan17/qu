import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface PlaceValueRowDef {
  label?: string;
  base?: number;
  weights?: number[];
  digits?: string[];
  result?: string;
  color?: string;
}

interface PlaceValueRowParams {
  eyebrow?: string;
  title?: string;
  rows?: PlaceValueRowDef[];
  brandSuffix?: string;
}

function renderPlaceCols(row: PlaceValueRowDef): string {
  const weights = row.weights ?? [8, 4, 2, 1];
  const digits = row.digits ?? ['1', '0', '1', '1'];
  const color = row.color ? `color:${row.color}` : '';
  return weights.map((w, i) => `
        <div class="place-col">
          <div class="place-label">${row.base ?? 2}${toSuperscript(Math.round(Math.log(w) / Math.log(row.base ?? 2)))} = ${w}</div>
          <div class="place-cell" style="${color}">${digits[i] ?? '?'}</div>
        </div>`).join('');
}

function toSuperscript(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰','1': '¹','2': '²','3': '³','4': '⁴',
    '5': '⁵','6': '⁶','7': '⁷','8': '⁸','9': '⁹',
  };
  return String(n).split('').map(c => map[c] ?? c).join('');
}

export function generatePlaceValueRowScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as PlaceValueRowParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const defaultRows: PlaceValueRowDef[] = [
    { label: '10進数 — 重みは 10ⁿ', base: 10, weights: [1000, 100, 10, 1], digits: ['3','7','2','5'], result: '3725', color: 'var(--ink-900)' },
    { label: '2進数 — 重みは 2ⁿ', base: 2, weights: [8, 4, 2, 1], digits: ['1','0','1','1'], result: '1011₂', color: 'var(--blue)' },
  ];
  const rows = p.rows ?? defaultRows;

  const rowHtml = rows.map((row, i) => `
    <div class="${sid}-row${i + 1}" style="margin-top:${i === 0 ? '60px' : '36px'}${i > 0 ? '; opacity:0' : ''}">
      <div style="font-size:24px; color:${row.color ?? 'var(--ink-900)'}; font-weight:700; margin-bottom:16px">${row.label ?? ''}</div>
      <div style="display:flex; gap:28px; align-items:flex-end">
        ${renderPlaceCols(row)}
        <div class="equals" style="font-size:48px; color:var(--ink-300); margin:0 12px">=</div>
        <div class="glow-num" style="color:${row.color ?? 'var(--ink-900)'}">${row.result ?? ''}</div>
      </div>
    </div>`).join('');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? '概念 · 位取り'}</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">${p.title ?? '桁の重み = 基数の累乗'}</h2>
  </div>
  ${rowHtml}
</div>`;

  const rowAnims = rows.map((_, i) => {
    const offset = i === 0 ? 0.9 : 4.0 + (i - 1) * 3;
    const reveal = i === 0 ? t + 2.2 : t + 4.0 + (i - 1) * 3 + 1.3;
    return `
tl.from('#${sid} .${sid}-row${i + 1} .place-col', { opacity: 0, y: 24, duration: 0.5, stagger: 0.18 }, ${t + offset});
${i > 0 ? `tl.to('#${sid} .${sid}-row${i + 1}', { opacity: 1, duration: 0.4 }, ${t + offset - 0.2});` : ''}
tl.from('#${sid} .${sid}-row${i + 1} .glow-num', { opacity: 0, scale: 0.9, duration: 0.5 }, ${reveal});`;
  }).join('');

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
${rowAnims}`;

  return { html, gsapJs, audioStart: input.startSec };
}
