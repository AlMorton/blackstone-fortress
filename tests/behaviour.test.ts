import { describe, expect, it } from "vitest";
import { CONFUSION, resolveAction } from "../app/lib/behaviour";
import type { BehaviourChartColumn } from "../app/types";

const traitorGuardEngaged: BehaviourChartColumn = {
  status: "Engaged",
  actions: [
    { from: 1, to: 3, actionTaken: "Fall Back" },
    { from: 4, to: 19, actionTaken: "Onslaught" },
    { from: 20, to: 20, actionTaken: "Fury" },
  ],
};

describe("resolveAction", () => {
  it("resolves each band, including its boundaries", () => {
    expect(resolveAction(traitorGuardEngaged, 1)).toBe("Fall Back");
    expect(resolveAction(traitorGuardEngaged, 3)).toBe("Fall Back");
    expect(resolveAction(traitorGuardEngaged, 4)).toBe("Onslaught");
    expect(resolveAction(traitorGuardEngaged, 19)).toBe("Onslaught");
    expect(resolveAction(traitorGuardEngaged, 20)).toBe("Fury");
  });

  it("falls back to Confusion! when a roll matches no band", () => {
    const gapped: BehaviourChartColumn = {
      status: "Gapped",
      actions: [{ from: 1, to: 5, actionTaken: "Hold" }],
    };
    expect(resolveAction(gapped, 6)).toBe(CONFUSION);
  });

  it("returns the first matching band when bands overlap", () => {
    const overlapping: BehaviourChartColumn = {
      status: "Overlap",
      actions: [
        { from: 1, to: 10, actionTaken: "First" },
        { from: 5, to: 15, actionTaken: "Second" },
      ],
    };
    expect(resolveAction(overlapping, 7)).toBe("First");
  });
});
