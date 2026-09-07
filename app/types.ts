/** One band of a d20 behaviour chart, e.g. rolls 13-19 mean "Charge". */
export interface RollRange {
  from: number;
  to: number;
  actionTaken: string;
}

/** A situation column on an enemy's behaviour chart: "Hidden", "Engaged", "In Cover"... */
export interface BehaviourChartColumn {
  status: string;
  actions: RollRange[];
}

/** A hostile type, loaded from one JSON file. Column count varies per enemy. */
export interface Enemy {
  /** Slug derived from the filename, e.g. "traitor-guard". */
  id: string;
  name: string;
  columns: BehaviourChartColumn[];
}

/**
 * A hostile placed in a group. Instance-based so a group can hold several of the
 * same enemy, each tracking its own roll independently.
 */
export interface EnemyInstance {
  instanceId: string;
  enemyId: string;
  /** Undefined until the player rolls for this hostile. */
  roll?: number;
  /** The resolved action name, e.g. "Onslaught". */
  status?: string;
  /** Which chart column was rolled against. */
  columnStatus?: string;
}

export interface EnemyGroup {
  number: number;
  name: string;
  members: EnemyInstance[];
}

/** An entry on the initiative track — either an explorer or a whole enemy group. */
export type InitiativeItem =
  | { kind: "adventurer"; id: string }
  | { kind: "group"; group: number };
