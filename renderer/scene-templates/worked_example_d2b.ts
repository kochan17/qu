import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface WorkedExampleD2BParams {
  decimal?: number;
  brandSuffix?: string;
}

interface DivStep {
  step: number;
  expr: string;
  quotient: number;
  remainder: number;
}

function decimalToBinarySteps(decimal: number): { steps: DivStep[]; binary: string } {
  const steps: DivStep[] = [];
  let n = decimal;
  let stepNum = 1;
  while (n > 0) {
    const q = Math.floor(n / 2);
    const r = n % 2;
    steps.push({ step: stepNum, expr: `${n} ÷ 2`, quotient: q, remainder: r });
    n = q;
    stepNum++;
  }
  const binary = steps.map(s => s.remainder).reverse().join('');
  return { steps, binary };
}

export function generateWorkedExampleD2BScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as WorkedExampleD2BParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const decimal = p.decimal ?? 13;
  const { steps, binary } = decimalToBinarySteps(decimal);

  const stepInterval = Math.max(2.5, (input.durationSec - 7) / steps.length);

  const stepRows = steps.map((s, i) => `
              <div class="table-row ${sid}-r${i + 1}" style="opacity:0">
                <div style="color:var(--ink-500)">${s.step}</div>
                <div>${s.expr}</div>
                <div>${s.quotient}</div>
                <div style="color:var(--blue)">${s.remainder}</div>
              </div>`).join('');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">変換 · 10進 → 2進</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">
      <span class="mono" style="color:var(--orange)">${decimal}₁₀</span> を 2進に
    </h2>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1.1fr; gap:48px; margin-top:24px; flex:1">
    <div>
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; margin-bottom:14px">手順</div>
      <div class="card" style="padding:32px; display:flex; flex-direction:column; gap:18px">
        <div style="font-size:30px; font-weight:700; line-height:1.45">
          <span class="summary-num" style="display:inline-flex; margin-right:14px">1</span>
          2 で割って <b>商</b>と<b>余り</b>を書く
        </div>
        <div style="font-size:30px; font-weight:700; line-height:1.45">
          <span class="summary-num" style="display:inline-flex; margin-right:14px">2</span>
          商が 0 になるまで繰り返す
        </div>
        <div style="font-size:30px; font-weight:700; line-height:1.45">
          <span class="summary-num" style="display:inline-flex; margin-right:14px">3</span>
          余りを <span style="color:var(--blue)">下から上</span>へ読む
        </div>
      </div>
      <div class="${sid}-arrow" style="opacity:0; margin-top:24px; padding:20px 24px; border-radius:18px; background:rgba(10,132,255,0.08); color:var(--blue); font-size:24px; font-weight:700">
        ↑ 余りを下から拾うのがコツ
      </div>
    </div>
    <div>
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; margin-bottom:14px">わり算の経過</div>
      <div class="card" style="overflow:hidden">
        <div class="table-row head">
          <div>#</div><div>計算</div><div>商</div><div>余り</div>
        </div>
        ${stepRows}
      </div>
    </div>
  </div>
  <div class="${sid}-final" style="opacity:0; align-self:center; margin-top:auto">
    <div class="ans-card">
      <span class="mono" style="font-size:56px; color:var(--ink-900)">${decimal}₁₀</span>
      <span style="color:var(--ink-300)">=</span>
      <span class="mono" style="font-size:56px">${binary}₂</span>
      <span style="font-size:40px">✓</span>
    </div>
  </div>
</div>`;

  const stepAnims = steps.map((_, i) =>
    `tl.fromTo('#${sid} .${sid}-r${i + 1}', { x: -20 }, { opacity: 1, x: 0, duration: 0.5 }, ${t + 6.0 + i * stepInterval});`
  ).join('\n');

  const arrowTime = t + 6.0 + steps.length * stepInterval + 1.0;

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
${stepAnims}
tl.fromTo('#${sid} .${sid}-arrow', { y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, ${arrowTime});
tl.fromTo('#${sid} .${sid}-final', { scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, ${arrowTime + 1.5});`;

  return { html, gsapJs, audioStart: input.startSec };
}
