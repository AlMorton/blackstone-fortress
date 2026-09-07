import { describe, expect, it } from "vitest";
import { ACTION_GROUP, actionDescriptions, describeAction } from "../app/lib/actions";
import rawGroups from "../app/data/enemy-actions.json";
import { CONFUSION, resolveAction } from "../app/lib/behaviour";
import { enemies } from "../app/lib/enemies";

const D20 = Array.from({ length: 20 }, (_, i) => i + 1);



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
    /**
     * Resolved per enemy, not by name alone: an action's text can differ between
     * enemies, so a name having text *somewhere* is not enough.
     */
    const missing: string[] = [];

    for (const enemy of enemies) {
      for (const column of enemy.columns) {
        for (const range of column.actions) {
          if (!describeAction(range.actionTaken, enemy.id)) {
            missing.push(`${enemy.id} / ${column.status} / ${range.actionTaken}`);
          }
        }
      }
    }

    expect(missing, `actions with no rules text:\n${missing.join("\n")}`).toEqual([]);
  });

  it("has non-empty text for each described action", () => {
    for (const [name, description] of actionDescriptions) {
      expect(description.trim(), name).not.toBe("");
    }
  });
});

describe("per-enemy action rules", () => {
  it("gives the Ambull and the Borewyrm different Tunnel rules", () => {
    const ambull = describeAction("Tunnel", "ambull");
    const borewyrm = describeAction("Tunnel", "borewyrm-infestation");

    expect(ambull).toContain("Ambull location marker");
    expect(borewyrm).toContain("discovery marker that is furthest");
    expect(ambull).not.toBe(borewyrm);
  });

  it("shares the base form's text with the enraged variant", () => {
    expect(describeAction("Tunnel", "ambull-enraged")).toBe(describeAction("Tunnel", "ambull"));
  });

  it("falls back to the shared set for common actions", () => {
    for (const id of ["ambull", "borewyrm-infestation", "ur-ghul"]) {
      expect(describeAction("Onslaught", id)).toContain("Attack the closest explorer");
    }
  });

  it("returns empty rather than throwing for an unknown enemy or action", () => {
    expect(describeAction("Tunnel", "space-hamster")).toBe("");
    expect(describeAction("Nonsense", "ambull")).toBe("");
    expect(describeAction(undefined, "ambull")).toBe("");
  });

  it("maps every enemy to action groups that exist in the data", () => {
    const declared = new Set(rawGroups.map((g) => g.Enemy));
    for (const enemy of enemies) {
      const chain = ACTION_GROUP[enemy.id];
      expect(chain, `${enemy.id} has no action group mapping`).toBeDefined();
      for (const group of chain!) {
        expect(declared.has(group), `${enemy.id} points at missing group "${group}"`).toBe(true);
      }
    }
  });

  it("lets a variant override only what its card rewords", () => {
    // The empowered Obsidius names itself in Overcharge but keeps Fury and Rush.
    expect(describeAction("Overcharge", "obsidius-mallex-empowered")).toContain(
      "Obsidius Mallex Empowered",
    );
    expect(describeAction("Overcharge", "obsidius-mallex")).not.toContain("Empowered");

    for (const action of ["Fury", "Rush"]) {
      expect(describeAction(action, "obsidius-mallex-empowered")).toBe(
        describeAction(action, "obsidius-mallex"),
      );
      expect(describeAction(action, "obsidius-mallex-empowered")).not.toBe("");
    }
  });

  it("declares no action group that nothing points at", () => {
    const used = new Set(Object.values(ACTION_GROUP).flat());
    const orphans = rawGroups
      .map((g) => g.Enemy)
      .filter((g) => g !== "All" && !used.has(g));
    expect(orphans, `unused action groups:\n${orphans.join("\n")}`).toEqual([]);
  });
});
