import { generateHookScene } from './hook.js';
import { generateWhyMattersScene } from './why_matters.js';
import { generateCounterAnimScene } from './counter_anim.js';
import { generateDigitCardGroupScene } from './digit_card_group.js';
import { generatePlaceValueRowScene } from './place_value_row.js';
import { generateWorkedExampleB2DScene } from './worked_example_b2d.js';
import { generateWorkedExampleD2BScene } from './worked_example_d2b.js';
import { generateNibbleShortcutScene } from './nibble_shortcut.js';
import { generateMiniExerciseScene } from './mini_exercise.js';
import { generateMistakesGridScene } from './mistakes_grid.js';
import { generateSummaryCardScene } from './summary_card.js';
import { generateNextBridgeScene } from './next_bridge.js';

export type SceneType =
  | 'hook'
  | 'why_matters'
  | 'counter_anim'
  | 'digit_card_group'
  | 'place_value_row'
  | 'worked_example_b2d'
  | 'worked_example_d2b'
  | 'nibble_shortcut'
  | 'mini_exercise'
  | 'mistakes_grid'
  | 'summary_card'
  | 'next_bridge';

export interface GenSceneInput {
  id: string;
  sceneType: SceneType;
  params: Record<string, unknown>;
  startSec: number;
  durationSec: number;
  totalScenes: number;
  index: number;
}

export interface GenSceneOutput {
  html: string;
  gsapJs: string;
  audioStart: number;
}

export function generateScene(input: GenSceneInput): GenSceneOutput {
  switch (input.sceneType) {
    case 'hook':
      return generateHookScene(input);
    case 'why_matters':
      return generateWhyMattersScene(input);
    case 'counter_anim':
      return generateCounterAnimScene(input);
    case 'digit_card_group':
      return generateDigitCardGroupScene(input);
    case 'place_value_row':
      return generatePlaceValueRowScene(input);
    case 'worked_example_b2d':
      return generateWorkedExampleB2DScene(input);
    case 'worked_example_d2b':
      return generateWorkedExampleD2BScene(input);
    case 'nibble_shortcut':
      return generateNibbleShortcutScene(input);
    case 'mini_exercise':
      return generateMiniExerciseScene(input);
    case 'mistakes_grid':
      return generateMistakesGridScene(input);
    case 'summary_card':
      return generateSummaryCardScene(input);
    case 'next_bridge':
      return generateNextBridgeScene(input);
  }
}

export function sceneLabel(index: number, total: number): string {
  return `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

export const BRAND_LABEL = 'QUE';
