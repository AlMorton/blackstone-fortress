import { describe, expect, it } from "vitest";
import { actionDescriptions } from "../app/lib/actions";
import { CONFUSION, resolveAction } from "../app/lib/behaviour";
import { enemies } from "../app/lib/enemies";

const D20 = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * Actions an enemy can roll that have no rules text, so the panel renders empty. A
 * pre-existing gap in the game data, allow-listed so the suite stays green while NEW
 * breakage still fails. Delete an entry once its description is added — the test below
 * asserts the list has not gone stale.
 */
const ACTIONS_WITHOUT_DESCRIPTIONS = [
  // The Ambull and the Borewyrm Infestation have genuinely different Tunnel rules,
  // and describeAction resolves by name alone, so one of them would get the other's
  // text. Left blank rather than wrong until the lookup is made enemy-aware.
  "Tunnel",
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

    expect(overlaps, `overlapping bands:\n${overlaps.join("\n")}`).toEqual([]);
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
