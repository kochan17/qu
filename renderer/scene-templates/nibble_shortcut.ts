import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface NibbleShortcutParams {
  binary8?: string;
  brandSuffix?: string;
}

const NIBBLE_TABLE = [
  ['0000','0'],['0001','1'],['0010','2'],['0011','3'],
  ['0100','4'],['0101','5'],['0110','6'],['0111','7'],
  ['1000','8'],['1001','9'],['1010','A'],['1011','B'],
  ['1100','C'],['1101','D'],['1110','E'],['1111','F'],
];

function binaryToHex(bin8: string): string {
  const clean = bin8.replace(/[^01]/g, '').padStart(8, '0').slice(0, 8);
  const high = parseInt(clean.slice(0, 4), 2).toString(16).toUpperCase();
  const low = parseInt(clean.slice(4, 8), 2).toString(16).toUpperCase();
  return high + low;
}

export function generateNibbleShortcutScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as NibbleShortcutParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const binary8 = (p.binary8 ?? '10110010').replace(/[^01]/g, '').padStart(8, '0').slice(0, 8);
  const hexResult = binaryToHex(binary8);
  const highBit = binary8.slice(0, 4);
  const lowBit = binary8.slice(4, 8);
  const highHex = hexResult[0];
  const lowHex = hexResult[1];

  const bitCells = binary8.split('').map((b, i) => {
    const isSep = i === 4;
    return `${isSep ? '<div style="width:24px"></div>' : ''}<div class="place-cell" style="width:80px; height:80px; font-size:36px; color:var(--blue)">${b}</div>`;
  }).join('\n              ');

  const nibbleRows = NIBBLE_TABLE.map(([bin, hex]) =>
    `<div><span class="b">${bin}</span> <span class="d">→</span> <span class="h">${hex}</span></div>`
  ).join('\n                ');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">テクニック · 16進ショートカット</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">
      2進 → 16進は <span class="underline-blue">4 ビットずつ</span>まとめる
    </h2>
  </div>
  <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:48px; margin-top:36px; flex:1">
    <div>
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; margin-bottom:14px">例: ${binary8}₂</div>
      <div style="display:flex; gap:10px" class="${sid}-bits">
        ${bitCells}
      </div>
      <div class="${sid}-brackets" style="opacity:0; display:flex; gap:10px; margin-top:14px">
        <div style="width:380px; text-align:center; font-size:22px; color:var(--purple); font-weight:700">← 4ビット →</div>
        <div style="width:24px"></div>
        <div style="width:380px; text-align:center; font-size:22px; color:var(--purple); font-weight:700">← 4ビット →</div>
      </div>
      <div class="${sid}-result" style="opacity:0; margin-top:32px; display:flex; gap:32px; align-items:center; justify-content:center">
        <div style="font-size:80px; font-weight:800; color:var(--purple); font-family:'JetBrains Mono',monospace">${highHex}</div>
        <div style="font-size:80px; font-weight:800; color:var(--purple); font-family:'JetBrains Mono',monospace">${lowHex}</div>
      </div>
    </div>
    <div>
      <div style="font-size:22px; color:var(--ink-500); font-weight:700; margin-bottom:14px">4ビット ↔ 16進 早見</div>
      <div class="card" style="padding:22px 28px">
        <div class="nibble-table">
          ${nibbleRows}
        </div>
      </div>
    </div>
  </div>
  <div class="${sid}-final" style="opacity:0; align-self:center; margin-top:auto">
    <div class="ans-card">
      <span class="mono" style="font-size:48px; color:var(--ink-900)">${binary8}₂</span>
      <span style="color:var(--ink-300)">=</span>
      <span class="mono" style="font-size:56px; color:var(--purple)">${hexResult}₁₆</span>
    </div>
  </div>
</div>`;

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
tl.from('#${sid} .${sid}-bits .place-cell', { opacity: 0, y: 14, duration: 0.4, stagger: 0.05 }, ${t + 0.9});
tl.fromTo('#${sid} .${sid}-brackets', { y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, ${t + 3.2});
tl.fromTo('#${sid} .${sid}-result', { y: 18, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, ${t + 6.0});
tl.fromTo('#${sid} .${sid}-final', { y: 18, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, ${t + 9.0});`;

  return { html, gsapJs, audioStart: input.startSec };
}
