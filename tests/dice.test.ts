import { describe, expect, it } from "vitest";
import { rollDie, shuffle } from "../app/lib/dice";

describe("rollDie", () => {
  it("only ever returns faces in 1..sides", () => {
    for (let i = 0; i < 5000; i++) {
      const roll = rollDie(20);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
      expect(Number.isInteger(roll)).toBe(true);
    }
  });

  it("reaches both extremes of a d20", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 20000; i++) seen.add(rollDie(20));
    expect(seen.size).toBe(20);
  });

  it("distributes roughly uniformly (no modulo bias)", () => {
    const counts = new Array(21).fill(0);
    const rolls = 60000;
    for (let i = 0; i < rolls; i++) counts[rollDie(20)]++;

    const expected = rolls / 20;
    for (let face = 1; face <= 20; face++) {
      // Generous bound: a biased modulo would skew low faces by ~7%, far outside this.
      expect(Math.abs(counts[face] - expected) / expected).toBeLessThan(0.15);
    }
  });

  it("rejects nonsense side counts", () => {
    expect(() => rollDie(1)).toThrow(RangeError);
    expect(() => rollDie(2.5)).toThrow(RangeError);
    expect(() => rollDie(300)).toThrow(RangeError);
  });
});

describe("shuffle", () => {
  it("preserves every member", () => {
    const input = ["a", "b", "c", "d", "e", "f"];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate its input", () => {
    const input = ["a", "b", "c"];
    shuffle(input);
    expect(input).toEqual(["a", "b", "c"]);
  });

  it("actually reorders over repeated runs", () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const orderings = new Set(Array.from({ length: 50 }, () => shuffle(input).join(",")));
    expect(orderings.size).toBeGreaterThan(1);
  });

  it("handles empty and single-item lists", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["only"])).toEqual(["only"]);
  });
});
