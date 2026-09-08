import { describe, expect, it } from 'vitest';
import {
  formatRelativeToPar,
  relativeToStrokes,
  strokesToRelative
} from './scoring.js';

describe('golf scoring helpers', () => {
  it('formats even par as E', () => {
    expect(formatRelativeToPar(0)).toBe('E');
    expect(formatRelativeToPar(2)).toBe('+2');
    expect(formatRelativeToPar(-1)).toBe('-1');
  });

  it('converts relative scores back to strokes', () => {
    expect(relativeToStrokes(3, 0)).toBe(3);
    expect(relativeToStrokes(3, 2)).toBe(5);
    expect(relativeToStrokes(3, -1)).toBe(2);
  });

  it('converts actual strokes into relative-to-par values', () => {
    expect(strokesToRelative(3, 3)).toBe(0);
    expect(strokesToRelative(5, 3)).toBe(2);
    expect(strokesToRelative(2, 3)).toBe(-1);
  });
});
