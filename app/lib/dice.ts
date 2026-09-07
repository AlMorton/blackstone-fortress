/**
 * Rejection sampling, ported from Services/Dice.cs — discards byte values in the
 * final partial cycle so every face is equally likely (a plain modulo would bias
 * the low faces, since 256 is not a multiple of 20).
 */
export function rollDie(sides = 20): number {
  if (!Number.isInteger(sides) || sides < 2 || sides > 256) {
    throw new RangeError(`sides must be an integer in 2..256, got ${sides}`);
  }

  const fullSetsOfValues = Math.floor(256 / sides);
  const limit = sides * fullSetsOfValues;
  const buffer = new Uint8Array(1);

  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0]!;
  } while (value >= limit);

  return (value % sides) + 1;
}

export const rollD20 = () => rollDie(20);

/** Fisher-Yates over crypto, replacing the nested-loop shuffle in the Blazor app. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** Uniform integer in [0, bound), again by rejection sampling. */
function randomBelow(bound: number): number {
  if (bound <= 1) return 0;
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / bound) * bound;
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0]!;
  } while (value >= limit);
  return value % bound;
}
