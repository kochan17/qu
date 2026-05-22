import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface SummaryRow {
  label?: string;
  text?: string;
}

interface SummaryCardParams {
  eyebrow?: string;
  title?: string;
  rows?: SummaryRow[];
  brandSuffix?: string;
}

export function generateSummaryCardScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as SummaryCardParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const defaultRows: SummaryRow[] = [
    { text: '<b>基数</b> = 使える数字の種類 (10進=10, 2進=2, 16進=16)' },
    { text: '<b>2進 → 10進</b>: 各桁 × 2の位置乗 を <b>合計</b>' },
    { text: '<b>10進 → 2進</b>: 2 で割り続け、<b>余りを下から</b>読む' },
    { text: '<b>2進 ↔ 16進</b>: <b>4ビット</b>ずつまとめれば 1 桁の 16進' },
  ];
  const rows = p.rows ?? defaultRows;

  const rowInterval = Math.max(1.5, (input.durationSec - 3) / rows.length);

  const rowHtml = rows.map((row, i) => `
          <div class="summary-row ${sid}-row${i + 1}" style="opacity:0">
            <div class="summary-num">${String(i + 1).padStart(2, '0')}</div>
            <div class="summary-text">${row.text ?? row.label ?? ''}</div>
          </div>`).join('');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? '要点まとめ · Memory Card'}</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">${p.title ?? 'この 1 枚を持ち帰る'}</h2>
  </div>
  <div class="card" style="margin-top:36px; padding:48px 56px; flex:1; display:flex; flex-direction:column; justify-content:center">
    ${rowHtml}
  </div>
</div>`;

  const rowAnims = rows.map((_, i) =>
    `tl.fromTo('#${sid} .${sid}-row${i + 1}', { x: -16 }, { opacity: 1, x: 0, duration: 0.5 }, ${t + 1.2 + i * rowInterval});`
  ).join('\n');

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
${rowAnims}`;

  return { html, gsapJs, audioStart: input.startSec };
}
