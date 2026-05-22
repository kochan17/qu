import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface CounterAnimParams {
  eyebrow?: string;
  title?: string;
  bits?: number;
  revealText?: string;
  brandSuffix?: string;
}

export function generateCounterAnimScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as CounterAnimParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;
  const bits = p.bits ?? 4;
  const maxVal = Math.pow(2, bits);

  // Generate bulb HTML
  const bulbs = Array.from({ length: bits }, (_, i) =>
    `<div class="bulb off ${sid}-b" data-i="${bits - 1 - i}">0</div>`
  ).join('\n            ');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? `具体例 · スイッチ${bits}個の世界`}</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">${p.title ?? `${bits} つのスイッチで 何種類 表せる?`}</h2>
  </div>
  <div style="display:flex; align-items:center; justify-content:center; gap:80px; margin-top:80px">
    <div style="display:flex; gap:32px" id="${sid}-bulbs">
      ${bulbs}
    </div>
    <div style="display:flex; flex-direction:column; gap:8px; align-items:center">
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; letter-spacing:.06em; text-transform:uppercase">何個目?</div>
      <div class="mono" id="${sid}-counter" style="font-size:120px; font-weight:800; line-height:1; letter-spacing:-0.04em">1 / ${maxVal}</div>
      <div style="font-size:22px; color:var(--ink-500); margin-top:8px">0000 から ${Array(bits).fill(1).join('')} まで</div>
    </div>
  </div>
  <div class="${sid}-reveal" style="margin-top:auto; align-self:center; opacity:0">
    <div style="font-family:'JetBrains Mono',monospace; font-size:64px; font-weight:800">
      <span style="color:var(--ink-500)">2</span><sup style="color:var(--ink-900); font-size:36px; font-weight:800">${bits}</sup>
      <span style="color:var(--ink-300); margin:0 12px">=</span>
      <span style="color:var(--orange)">${maxVal}</span>
      <span style="color:var(--ink-500); margin-left:18px; font-size:36px">${p.revealText ?? '状態'}</span>
    </div>
  </div>
</div>`;

  const counterDur = Math.max(5, input.durationSec - 3);

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
(function() {
  const stateCount = ${maxVal};
  function bits${sid}(n) {
    return [${Array.from({ length: bits }, (_, i) => `(n >> ${bits - 1 - i}) & 1`).join(', ')}];
  }
  for (let n = 0; n < stateCount; n++) {
    const tt = ${t + 0.9} + (n / (stateCount - 1)) * ${counterDur};
    const b = bits${sid}(n);
    const cells = document.querySelectorAll('#${sid} .${sid}-b');
    for (let i = 0; i < ${bits}; i++) {
      tl.call((el, val) => {
        if (!el) return;
        el.classList.toggle('on', val === 1);
        el.classList.toggle('off', val === 0);
        el.textContent = String(val);
      }, [cells[i], b[i]], tt);
    }
    tl.call((el, val) => {
      if (!el) return;
      el.textContent = val + ' / ${maxVal}';
    }, [document.getElementById('${sid}-counter'), n + 1], tt);
  }
})();
tl.fromTo('#${sid} .${sid}-reveal', { y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, ${t + counterDur + 1.5});`;

  return { html, gsapJs, audioStart: input.startSec };
}
