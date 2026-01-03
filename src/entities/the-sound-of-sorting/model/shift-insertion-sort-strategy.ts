import { GREEN } from '@/shared/lib/rgba.ts';
import { ShellSortStrategy } from './shell-sort-strategy.ts';
import type { HighlightGroup } from './sorting-strategy.ts';

class ShiftInsertionSortStrategy extends ShellSortStrategy {
  protected getGaps(): number[] {
    return [1];
  }

  protected getAdditionalHighlights(i: number): HighlightGroup[] {
    return [
      {
        indices: [i],
        color: GREEN,
        skipHighlightGroupTone: true,
      },
    ];
  }
}

export { ShiftInsertionSortStrategy };
