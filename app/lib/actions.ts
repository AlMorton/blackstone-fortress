import raw from "../data/enemy-actions.json";

interface RawActionGroup {
  Enemy: string;
  Actions: Array<{ Name: string; Description: string }>;
}

const SHARED = "All";

/**
 * Which action groups in enemy-actions.json describe each enemy's unique actions, in
 * priority order, with the shared "All" set always tried last.
 *
 * Explicit rather than derived from the slug: the group names do not follow the
 * filenames ("Cultists" vs cultist, "ChaosSpaceMarine" vs chaos-spacemarine).
 *
 * A chain rather than a single group so a variant can override only what its card
 * actually words differently. The empowered Obsidius reworded Overcharge but kept Fury
 * and Rush verbatim, so it overrides the one and inherits the other two instead of
 * duplicating them. The enraged Ambull reworded nothing, so it just points at the base.
 */
const ACTION_GROUP: Record<string, readonly string[]> = {
  ambull: ["Ambull"],
  "ambull-enraged": ["Ambull"],
  "borewyrm-infestation": ["BorewyrmInfestation"],
  "chaos-beastman": ["ChaosBeastman"],
  "chaos-spacemarine": ["ChaosSpaceMarine"],
  cultist: ["Cultists"],
  "cultist-firebrand": ["CultistFirebrand"],
  "negavolt-cultist": ["NegavoltCultist"],
  "obsidius-mallex": ["ObsidiusMallex"],
  "obsidius-mallex-empowered": ["ObsidiusMallexEmpowered", "ObsidiusMallex"],
  "rogue-psyker": ["RoguePsyker"],
  "spindle-drone": ["SpindleDrone"],
  "traitor-guard": ["TraitorGuard"],
  "ur-ghul": ["UrGhul"],
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
 * furthest discovery marker), and the empowered Obsidius names itself in Overcharge.
 * A name-only lookup would hand one enemy another's rules, so the enemy's own groups
 * are consulted in order and the shared set is the fallback.
 */
export function describeAction(name: string | undefined, enemyId?: string): string {
  if (!name) return "";
  for (const groupName of (enemyId && ACTION_GROUP[enemyId]) || []) {
    const text = byGroup.get(groupName)?.get(name);
    if (text) return text;
  }
  return shared.get(name) ?? "";
}

/** Every action name that has rules text somewhere, for data-integrity checks. */
export const actionDescriptions: ReadonlyMap<string, string> = new Map(
  groups.flatMap((g) => g.Actions.map((a) => [a.Name, a.Description] as const)),
);

export { ACTION_GROUP };
