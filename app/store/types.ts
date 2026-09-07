import type { EnemyGroup, InitiativeItem } from "~/types";

export type { EnemyGroup, InitiativeItem };

export interface GameState {
  groups: Record<number, EnemyGroup>;
  initiative: InitiativeItem[];
}
