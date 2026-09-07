import type { BehaviourChartColumn, Enemy } from "~/types";

/**
 * Raw shape of the files in app/data/enemies. Kept PascalCase and byte-identical to
 * the Blazor app's wwwroot/enemy-data so the two stay interchangeable.
 */
interface RawEnemy {
  Name: string;
  BehaviourChartColumns: Array<{
    Status: string;
    Actions: Array<{ From: number; To: number; ActionTaken: string }>;
  }>;
}

/**
 * Auto-discovery replaces EnemyFileNameConstants in the Blazor app, where every new
 * enemy had to be registered in a hardcoded `new string[14]`. Drop a JSON file in
 * app/data/enemies and it appears in the picker.
 */
const modules = import.meta.glob<{ default: RawEnemy }>("../data/enemies/*.json", {
  eager: true,
});

function toSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.json$/, "");
}

function toEnemy(path: string, raw: RawEnemy): Enemy {
  const id = toSlug(path);

  if (!raw?.Name) throw new Error(`${path}: missing "Name"`);
  if (!Array.isArray(raw.BehaviourChartColumns) || raw.BehaviourChartColumns.length === 0) {
    throw new Error(`${path}: missing or empty "BehaviourChartColumns"`);
  }

  const columns: BehaviourChartColumn[] = raw.BehaviourChartColumns.map((column) => ({
    status: column.Status,
    actions: column.Actions.map((range) => ({
      from: range.From,
      to: range.To,
      actionTaken: range.ActionTaken,
    })),
  }));

  return { id, name: raw.Name, columns };
}

/** Every hostile, sorted by display name (the picker order in the Blazor app). */
export const enemies: Enemy[] = Object.entries(modules)
  .map(([path, module]) => toEnemy(path, module.default))
  .sort((a, b) => a.name.localeCompare(b.name));

const byId = new Map(enemies.map((enemy) => [enemy.id, enemy]));

export function hasEnemy(id: string): boolean {
  return byId.has(id);
}

export function getEnemy(id: string): Enemy {
  const enemy = byId.get(id);
  if (!enemy) throw new Error(`Unknown enemy id: ${id}`);
  return enemy;
}
