import { GREEN } from '@/shared/lib/rgba.ts';
import { ShellSortStrategy } from './shell-sort-strategy.ts';
import type { HighlightGroup } from './sorting-strategy.ts';

class ShiftInsertionSortStrategy extends ShellSortStrategy {
  protected override getGaps(): number[] {
    return [1];
  }

  protected override getAdditionalHighlights(i: number): HighlightGroup[] {
    return [{ color: GREEN, indices: [i], skipTone: true }];
  }
}

export { ShiftInsertionSortStrategy };
