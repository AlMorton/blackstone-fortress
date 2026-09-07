import { resolveAction } from "~/lib/behaviour";
import { shuffle } from "~/lib/dice";
import { getEnemy } from "~/lib/enemies";
import type { EnemyGroup, GameState, InitiativeItem } from "./types";

export const GROUP_COUNT = 8;

export function createInitialState(): GameState {
  const groups: Record<number, EnemyGroup> = {};
  for (let n = 1; n <= GROUP_COUNT; n++) {
    groups[n] = { number: n, name: `Group ${n}`, members: [] };
  }
  return { groups, initiative: [] };
}

export type GameAction =
  | { type: "toggleAdventurer"; name: string }
  | { type: "addEnemy"; group: number; enemyId: string }
  | { type: "removeInstance"; group: number; instanceId: string }
  | { type: "roll"; group: number; instanceId: string; columnStatus: string; roll: number }
  | { type: "shuffleTrack" }
  | { type: "moveTrackItem"; from: number; to: number };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "toggleAdventurer": {
      const exists = state.initiative.some(
        (item) => item.kind === "adventurer" && item.id === action.name,
      );
      return {
        ...state,
        initiative: exists
          ? state.initiative.filter(
              (item) => !(item.kind === "adventurer" && item.id === action.name),
            )
          : [...state.initiative, { kind: "adventurer", id: action.name }],
      };
    }

    case "addEnemy": {
      // Validates the id up front so a bad slug fails loudly rather than rendering blank.
      getEnemy(action.enemyId);
      const group = state.groups[action.group]!;
      const members = [
        ...group.members,
        { instanceId: crypto.randomUUID(), enemyId: action.enemyId },
      ];
      return syncTrack({
        ...state,
        groups: { ...state.groups, [action.group]: { ...group, members } },
      });
    }

    case "removeInstance": {
      const group = state.groups[action.group]!;
      const members = group.members.filter((m) => m.instanceId !== action.instanceId);
      return syncTrack({
        ...state,
        groups: { ...state.groups, [action.group]: { ...group, members } },
      });
    }

    case "roll": {
      const group = state.groups[action.group]!;
      const members = group.members.map((member) => {
        if (member.instanceId !== action.instanceId) return member;
        const column = getEnemy(member.enemyId).columns.find(
          (c) => c.status === action.columnStatus,
        );
        if (!column) return member;
        return {
          ...member,
          roll: action.roll,
          status: resolveAction(column, action.roll),
          columnStatus: action.columnStatus,
        };
      });
      return { ...state, groups: { ...state.groups, [action.group]: { ...group, members } } };
    }

    case "shuffleTrack":
      return { ...state, initiative: shuffle(state.initiative) };

    case "moveTrackItem": {
      const { from, to } = action;
      const track = [...state.initiative];
      if (from === to || !track[from] || to < 0 || to >= track.length) return state;
      const [moved] = track.splice(from, 1);
      track.splice(to, 0, moved!);
      return { ...state, initiative: track };
    }

    default:
      return state;
  }
}

/**
 * A group belongs on the initiative track exactly while it has members. New groups are
 * appended; emptied groups drop out. Existing track order is otherwise preserved.
 */
function syncTrack(state: GameState): GameState {
  const shouldBeOnTrack = (n: number) => state.groups[n]!.members.length > 0;

  const kept = state.initiative.filter(
    (item) => item.kind !== "group" || shouldBeOnTrack(item.group),
  );

  const present = new Set(
    kept.filter((item): item is Extract<InitiativeItem, { kind: "group" }> => item.kind === "group")
      .map((item) => item.group),
  );

  const added: InitiativeItem[] = [];
  for (let n = 1; n <= GROUP_COUNT; n++) {
    if (shouldBeOnTrack(n) && !present.has(n)) added.push({ kind: "group", group: n });
  }

  return { ...state, initiative: [...kept, ...added] };
}
