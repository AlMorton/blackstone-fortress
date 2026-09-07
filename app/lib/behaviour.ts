import type { BehaviourChartColumn } from "~/types";

/** Shown when a roll falls outside every band — matches BehaviourChart.cs. */
export const CONFUSION = "Confusion!";

/** Resolve a d20 roll against one column of an enemy's behaviour chart. */
export function resolveAction(column: BehaviourChartColumn, roll: number): string {
  for (const range of column.actions) {
    if (roll >= range.from && roll <= range.to) return range.actionTaken;
  }
  return CONFUSION;
}
