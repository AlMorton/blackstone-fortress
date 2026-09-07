import { describe, expect, it } from "vitest";
import { actionDescriptions } from "../app/lib/actions";
import { CONFUSION, resolveAction } from "../app/lib/behaviour";
import { enemies } from "../app/lib/enemies";

const D20 = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * Pre-existing defects inherited from the Blazor app's game data. They are allow-listed
 * so the suite stays green and NEW breakage still fails, but each one is a real gap a
 * player can hit. Delete an entry once the underlying data is fixed — the tests below
 * assert the list has not gone stale.
 */

/** Actions an enemy can roll that have no rules text, so the panel renders empty. */
const ACTIONS_WITHOUT_DESCRIPTIONS = [
  "All Shall Burn",
  "Consume",
  "Firestorm",
  "Full-auto",
  "Overwhelm",
  "Swipe",
  "Tunnel",
];

/**
 * negavolt-cultist "Other" declares Recharge as 1-3 and Charge as 1-9. First match
 * wins, so rolls 1-3 resolve to Recharge; Charge's band is most likely meant to be 4-9.
 */
const OVERLAPPING_BANDS = [
  "negavolt-cultist / Other / roll 1: Recharge vs Charge",
  "negavolt-cultist / Other / roll 2: Recharge vs Charge",
  "negavolt-cultist / Other / roll 3: Recharge vs Charge",
];

describe("enemy data", () => {
  it("loads every JSON file in app/data/enemies", () => {
    expect(enemies.length).toBe(14);
  });

  it("gives every enemy a name and at least one chart column", () => {
    for (const enemy of enemies) {
      expect(enemy.name, enemy.id).toBeTruthy();
      expect(enemy.columns.length, enemy.id).toBeGreaterThan(0);
    }
  });

  /**
   * The valuable one: a gap or typo in any band means a player rolls and gets
   * "Confusion!" mid-game. This checks all 14 enemies x every column x all 20 faces.
   */
  it("resolves all 20 faces on every column of every enemy", () => {
    const gaps: string[] = [];

    for (const enemy of enemies) {
      for (const column of enemy.columns) {
        for (const roll of D20) {
          if (resolveAction(column, roll) === CONFUSION) {
            gaps.push(`${enemy.id} / ${column.status} / roll ${roll}`);
          }
        }
      }
    }

    expect(gaps, `unreachable rolls:\n${gaps.join("\n")}`).toEqual([]);
  });

  it("keeps bands within 1..20 and non-inverted", () => {
    for (const enemy of enemies) {
      for (const column of enemy.columns) {
        for (const range of column.actions) {
          const where = `${enemy.id} / ${column.status} / ${range.actionTaken}`;
          expect(range.from, where).toBeGreaterThanOrEqual(1);
          expect(range.to, where).toBeLessThanOrEqual(20);
          expect(range.from, where).toBeLessThanOrEqual(range.to);
        }
      }
    }
  });

  it("does not overlap bands within a column", () => {
    const overlaps: string[] = [];

    for (const enemy of enemies) {
      for (const column of enemy.columns) {
        const covered = new Map<number, string>();
        for (const range of column.actions) {
          for (let roll = range.from; roll <= range.to; roll++) {
            const existing = covered.get(roll);
            if (existing) {
              overlaps.push(
                `${enemy.id} / ${column.status} / roll ${roll}: ${existing} vs ${range.actionTaken}`,
              );
            }
            covered.set(roll, range.actionTaken);
          }
        }
      }
    }

    const unexpected = overlaps.filter((entry) => !OVERLAPPING_BANDS.includes(entry));
    expect(unexpected, `new overlapping bands:\n${unexpected.join("\n")}`).toEqual([]);

    const fixed = OVERLAPPING_BANDS.filter((entry) => !overlaps.includes(entry));
    expect(fixed, `fixed in the data — drop from OVERLAPPING_BANDS:\n${fixed.join("\n")}`)
      .toEqual([]);
  });
});

describe("action descriptions", () => {
  /**
   * The invariant the Blazor app depends on silently: EnemyComponent looks the action
   * name up in the ActionsService dictionary, and a miss renders an empty rules panel.
   */
  it("has rules text for every action any enemy can roll", () => {
    const missing = new Set<string>();

    for (const enemy of enemies) {
      for (const column of enemy.columns) {
        for (const range of column.actions) {
          if (!actionDescriptions.has(range.actionTaken)) missing.add(range.actionTaken);
        }
      }
    }

    const unexpected = [...missing].filter((name) => !ACTIONS_WITHOUT_DESCRIPTIONS.includes(name));
    expect(unexpected, `actions with no rules text:\n${unexpected.join("\n")}`).toEqual([]);

    const fixed = ACTIONS_WITHOUT_DESCRIPTIONS.filter((name) => !missing.has(name));
    expect(fixed, `now described — drop from ACTIONS_WITHOUT_DESCRIPTIONS:\n${fixed.join("\n")}`)
      .toEqual([]);
  });

  it("has non-empty text for each described action", () => {
    for (const [name, description] of actionDescriptions) {
      expect(description.trim(), name).not.toBe("");
    }
  });
});
