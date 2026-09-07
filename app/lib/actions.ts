import raw from "../data/enemy-actions.json";

interface RawActionGroup {
  Enemy: string;
  Actions: Array<{ Name: string; Description: string }>;
}

const SHARED = "All";

/**
 * Which action group in enemy-actions.json describes each enemy's unique actions.
 * Explicit rather than derived from the slug: the group names are inconsistent with
 * the filenames ("Cultists" vs cultist, "ChaosSpaceMarine" vs chaos-spacemarine), and
 * the enraged/empowered variants share their base form's rules text.
 */
const ACTION_GROUP: Record<string, string> = {
  ambull: "Ambull",
  "ambull-enraged": "Ambull",
  "borewyrm-infestation": "BorewyrmInfestation",
  "chaos-beastman": "ChaosBeastman",
  "chaos-spacemarine": "ChaosSpaceMarine",
  cultist: "Cultists",
  "cultist-firebrand": "CultistFirebrand",
  "negavolt-cultist": "NegavoltCultist",
  "obsidius-mallex": "ObsidiusMallex",
  "obsidius-mallex-empowered": "ObsidiusMallex",
  "rogue-psyker": "RoguePsyker",
  "spindle-drone": "SpindleDrone",
  "traitor-guard": "TraitorGuard",
  "ur-ghul": "UrGhul",
};

const groups = raw as RawActionGroup[];

const byGroup: ReadonlyMap<string, ReadonlyMap<string, string>> = new Map(
  groups.map((group) => [
    group.Enemy,
    new Map(group.Actions.map((a) => [a.Name, a.Description] as const)),
  ]),
);

const shared = byGroup.get(SHARED) ?? new Map<string, string>();

/**
 * Rules text for an action as printed on that enemy's own card.
 *
 * The enemy matters: Tunnel means something different for the Ambull (burrow away and
 * resurface next activation) than for the Borewyrm Infestation (relocate to the
 * furthest discovery marker). A name-only lookup would hand one of them the other's
 * rules, so the enemy's own group is consulted first and the shared set is the
 * fallback.
 */
export function describeAction(name: string | undefined, enemyId?: string): string {
  if (!name) return "";
  const group = enemyId ? byGroup.get(ACTION_GROUP[enemyId] ?? "") : undefined;
  return group?.get(name) ?? shared.get(name) ?? "";
}

/** Every action name that has rules text somewhere, for data-integrity checks. */
export const actionDescriptions: ReadonlyMap<string, string> = new Map(
  groups.flatMap((g) => g.Actions.map((a) => [a.Name, a.Description] as const)),
);

export { ACTION_GROUP };
