import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface WorkedExampleB2DParams {
  binary?: string;
  brandSuffix?: string;
}

function parseBinary(bin: string): { bits: number[]; decimal: number } {
  const bits = bin.replace(/[^01]/g, '').split('').map(Number);
  const decimal = bits.reduce((acc, b, i) => acc + b * Math.pow(2, bits.length - 1 - i), 0);
  return { bits, decimal };
}

export function generateWorkedExampleB2DScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as WorkedExampleB2DParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const binaryStr = p.binary ?? '1011';
  const { bits, decimal } = parseBinary(binaryStr);
  const n = bits.length;

  // Step interval: distribute over (durationSec - 4) / n
  const stepInterval = Math.max(1.5, (input.durationSec - 5) / n);

  const placeCols = bits.map((b, i) => {
    const exp = n - 1 - i;
    return `
          <div class="place-col">
            <div class="place-label">2${sup(exp)}</div>
            <div class="place-cell" style="color:var(--blue)">${b}</div>
          </div>`;
  }).join('');

  const stepValues = bits.map((b, i) => {
    const exp = n - 1 - i;
    const val = b * Math.pow(2, exp);
    return { b, exp, pow: Math.pow(2, exp), val };
  });

  const stepRows = stepValues.map((s, i) => `
            <div class="step-row ${sid}-step${i + 1}" style="opacity:0">
              <div class="step-num">${i + 1}</div>
              <div class="mono" style="font-size:30px; font-weight:700">
                <span style="color:var(--blue)">${s.b}</span> × 2${sup(s.exp)} = ${s.b} × ${s.pow}
              </div>
              <div class="mono" style="font-size:30px; font-weight:800; text-align:right${s.val === 0 ? '; color:var(--ink-500)' : ''}">= ${s.val}</div>
            </div>`).join('');

  const sumExpr = stepValues.map(s => s.val).join(' + ');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">変換 · 2進 → 10進</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">
      <span class="mono" style="color:var(--blue)">${binaryStr}₂</span> を 10進に
    </h2>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-top:36px; flex:1">
    <div>
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; margin-bottom:14px">桁ごとに 重み × 値</div>
      <div style="display:flex; gap:18px" class="${sid}-cells">
        ${placeCols}
      </div>
    </div>
    <div style="display:flex; flex-direction:column; gap:14px">
      ${stepRows}
      <div class="${sid}-sum" style="opacity:0; padding:22px 28px; border-radius:18px; background:rgba(10,132,255,0.06); border:1px solid rgba(10,132,255,0.25); margin-top:8px">
        <div class="mono" style="font-size:34px; font-weight:800; text-align:center">
          ${sumExpr} = <span style="color:var(--blue)">${decimal}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="${sid}-final" style="opacity:0; align-self:center; margin-top:auto">
    <div class="ans-card">
      <span class="mono" style="font-size:56px; color:var(--ink-900)">${binaryStr}₂</span>
      <span style="color:var(--ink-300)">=</span>
      <span class="mono" style="font-size:56px">${decimal}₁₀</span>
      <span style="font-size:40px">✓</span>
    </div>
  </div>
</div>`;

  const stepAnims = stepValues.map((_, i) =>
    `tl.fromTo('#${sid} .${sid}-step${i + 1}', { y: 14 }, { opacity: 1, y: 0, duration: 0.45 }, ${t + 3.0 + i * stepInterval});`
  ).join('\n');

  const sumTime = t + 3.0 + n * stepInterval + 0.5;

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
tl.from('#${sid} .${sid}-cells .place-col', { opacity: 0, y: 18, duration: 0.4, stagger: 0.15 }, ${t + 0.85});
${stepAnims}
tl.fromTo('#${sid} .${sid}-sum', { y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, ${sumTime});
tl.fromTo('#${sid} .${sid}-final', { scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, ${sumTime + 1.5});`;

  return { html, gsapJs, audioStart: input.startSec };
}

function sup(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰','1': '¹','2': '²','3': '³','4': '⁴',
    '5': '⁵','6': '⁶','7': '⁷','8': '⁸','9': '⁹',
  };
  return String(n).split('').map(c => map[c] ?? c).join('');
}
