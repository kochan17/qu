import type { GenSceneInput, GenSceneOutput } from './index.js';
import { sceneLabel, BRAND_LABEL } from './index.js';

interface MistakeItem {
  label?: string;
  bad?: string;
  good?: string;
  note?: string;
}

interface MistakesGridParams {
  eyebrow?: string;
  title?: string;
  items?: MistakeItem[];
  brandSuffix?: string;
}

export function generateMistakesGridScene(input: GenSceneInput): GenSceneOutput {
  const p = input.params as MistakesGridParams;
  const sid = `s${input.index}`;
  const t = input.startSec;
  const label = sceneLabel(input.index, input.totalScenes);
  const brand = p.brandSuffix ? `${BRAND_LABEL} · ${p.brandSuffix}` : BRAND_LABEL;

  const defaultItems: MistakeItem[] = [
    { label: '余りの読み方', bad: '❌ 上から読む', good: '✓ 下から上へ', note: '一番下の余りが 1 の位' },
    { label: '16進の文字', bad: '❌ A = 11', good: '✓ A = 10, F = 15', note: 'アルファベットは 10 から' },
    { label: '添え字を省略', bad: '❌ 「1011 = 11」', good: '✓ 1011₂ = 11₁₀', note: '基数を必ず書く' },
  ];
  const items = p.items ?? defaultItems;

  const mistakeHtml = items.map((item, i) => `
          <div class="mistake ${sid}-m${i + 1}">
            <div class="label">${item.label ?? ''}</div>
            <div class="bad">${item.bad ?? ''}</div>
            <div class="good">${item.good ?? ''}</div>
            <div style="font-size:22px; color:var(--ink-500); margin-top:6px">${item.note ?? ''}</div>
          </div>`).join('');

  const html = `
<div id="${sid}" class="scene clip" data-start="${input.startSec}" data-duration="${input.durationSec}" data-track-index="0">
  <div class="brand">${brand}</div>
  <div class="scene-num">${label}</div>
  <div style="margin-top:24px">
    <div class="eyebrow ${sid}-eyebrow">${p.eyebrow ?? '注意 · 落とし穴'}</div>
    <h2 class="title-md ${sid}-title" style="margin-top:14px">${p.title ?? `よくある間違い ${items.length} つ`}</h2>
  </div>
  <div style="margin-top:48px; display:grid; grid-template-columns:repeat(${items.length},1fr); gap:28px">
    ${mistakeHtml}
  </div>
</div>`;

  const mistakeAnims = items.map((_, i) =>
    `tl.from('#${sid} .${sid}-m${i + 1}', { opacity: 0, y: 30, duration: 0.55 }, ${t + 1.0 + i * 0.4});`
  ).join('\n');

  const gsapJs = `
tl.from('#${sid} .${sid}-eyebrow', { opacity: 0, y: 12, duration: 0.4 }, ${t + 0.1});
tl.from('#${sid} .${sid}-title', { opacity: 0, y: 18, duration: 0.5 }, ${t + 0.25});
${mistakeAnims}`;

  return { html, gsapJs, audioStart: input.startSec };
}
