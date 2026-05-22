import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface DigitCard {
  label?: string;
  name?: string;
  digits?: string[];
  accentClass?: string;
  note?: string;
}

interface DigitCardGroupParams {
  eyebrow?: string;
  title?: string;
  cards?: DigitCard[];
  brandSuffix?: string;
}

function renderDigits(digits: string[], accentClass?: string): string {
  return digits
    .map(d => `<span class="digit-chip${accentClass ? ' ' + accentClass : ''}">${d}</span>`)
    .join('\n          ');
}

export function generateDigitCardGroupScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as DigitCardGroupParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const defaultCards: DigitCard[] = [
    {
      label: '10進数', name: 'Decimal · base 10',
      digits: ['0','1','2','3','4','5','6','7','8','9'],
      note: '10 種類',
    },
    {
      label: '2進数', name: 'Binary · base 2',
      digits: ['0','1'], accentClass: 'accent-blue',
      note: '2 種類 · ON / OFF だけ',
    },
    {
      label: '16進数', name: 'Hexadecimal · base 16',
      digits: ['0','1','2','3','4','5','6','7','8','9'],
      accentClass: 'accent-purple',
      note: '16 種類 · A=10, F=15',
    },
  ];

  const cards = p.cards ?? defaultCards;

  const cardHtml = cards.map((c, i) => `
    <div class="digit-card ${sid}-card${i + 1}">
      <div class="label">${c.label ?? ''}</div>
      <div class="name">${c.name ?? ''}</div>
      <div class="digits">
        ${renderDigits(c.digits ?? [], c.accentClass)}
      </div>
      <div style="margin-top:auto; font-size:24px; color:var(--ink-500); font-weight:600">${c.note ?? ''}</div>
    </div>`).join('\n');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? '概念 · 基数 (radix)'}</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">${p.title ?? '基数 = 使える数字の種類'}</h2>
  </div>
  <div class="grid-3" style="margin-top:60px">
    ${cardHtml}
  </div>
</div>`;

  const cardAnims = cards.map((_, i) =>
    `tl.from('#${sid} .${sid}-card${i + 1}', { opacity: 0, y: 28, duration: 0.5 }, ${t + 0.85 + i * 0.25});`
  ).join('\n');

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
${cardAnims}`;

  return { html, gsapJs, audioStart: input.startSec };
}
