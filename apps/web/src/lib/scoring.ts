export const formatRelativeToPar = (value: number): string =>
  value === 0 ? 'E' : value > 0 ? `+${value.toString()}` : value.toString();

export const strokesToRelative = (strokes: number, par: number): number =>
  strokes - par;

export const relativeToStrokes = (par: number, relative: number): number =>
  par + relative;
