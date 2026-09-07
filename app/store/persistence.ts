import { ADVENTURERS } from "~/lib/adventurers";
import { hasEnemy } from "~/lib/enemies";
import { GROUP_COUNT, createInitialState, syncTrack } from "./gameState";
import type { GameState } from "./types";
import type { EnemyInstance, InitiativeItem } from "~/types";

const KEY = "blackstone-fortress:arena";

/** Bump when the persisted shape changes; older payloads are then discarded. */
const VERSION = 1;

interface Persisted {
  version: number;
  groups: Array<{ number: number; members: EnemyInstance[] }>;
  initiative: InitiativeItem[];
}

export function serialize(state: GameState): string {
  const payload: Persisted = {
    version: VERSION,
    groups: Object.values(state.groups)
      .filter((group) => group.members.length > 0)
      .map((group) => ({ number: group.number, members: group.members })),
    initiative: state.initiative,
  };
  return JSON.stringify(payload);
}

/**
 * Rebuilds state from a stored payload, discarding anything that no longer makes
 * sense. This matters: an enemy id whose JSON file has since been deleted would throw
 * from getEnemy during render, leaving the app unopenable until storage was cleared
 * by hand. Returns null when there is nothing usable to restore.
 */
export function deserialize(raw: string | null): GameState | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || parsed.version !== VERSION) return null;

  const state = createInitialState();

  const groups = Array.isArray(parsed.groups) ? parsed.groups : [];
  for (const group of groups) {
    if (!isRecord(group)) continue;
    const number = group.number;
    if (typeof number !== "number" || !Number.isInteger(number)) continue;
    if (number < 1 || number > GROUP_COUNT) continue;

    const members = Array.isArray(group.members) ? group.members : [];
    state.groups[number]!.members = members.filter(isValidMember);
  }

  const initiative = Array.isArray(parsed.initiative) ? parsed.initiative : [];
  const seen = new Set<string>();
  state.initiative = initiative.filter((item): item is InitiativeItem => {
    if (!isValidTrackItem(item)) return false;
    const key = item.kind === "adventurer" ? `a:${item.id}` : `g:${item.group}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Re-apply the invariant that a group is on the track exactly while it has members.
  const restored = syncTrack(state);
  const empty = restored.initiative.length === 0;
  return empty ? null : restored;
}

export function loadState(): GameState | null {
  try {
    return deserialize(localStorage.getItem(KEY));
  } catch {
    // Private mode, disabled storage, or a browser that throws on access.
    return null;
  }
}

/** Writing an empty arena removes the key rather than leaving an empty payload behind. */
export function saveState(state: GameState): void {
  try {
    if (isEmpty(state)) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, serialize(state));
  } catch {
    // Quota or disabled storage — persistence is a convenience, never required.
  }
}

export function isEmpty(state: GameState): boolean {
  return (
    state.initiative.length === 0 &&
    Object.values(state.groups).every((group) => group.members.length === 0)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidMember(member: unknown): member is EnemyInstance {
  if (!isRecord(member)) return false;
  if (typeof member.instanceId !== "string" || member.instanceId === "") return false;
  if (typeof member.enemyId !== "string" || !hasEnemy(member.enemyId)) return false;
  if (member.roll !== undefined && typeof member.roll !== "number") return false;
  if (member.status !== undefined && typeof member.status !== "string") return false;
  if (member.columnStatus !== undefined && typeof member.columnStatus !== "string") {
    return false;
  }
  return true;
}

function isValidTrackItem(item: unknown): boolean {
  if (!isRecord(item)) return false;
  if (item.kind === "adventurer") {
    return typeof item.id === "string" && (ADVENTURERS as readonly string[]).includes(item.id);
  }
  if (item.kind === "group") {
    return (
      typeof item.group === "number" &&
      Number.isInteger(item.group) &&
      item.group >= 1 &&
      item.group <= GROUP_COUNT
    );
  }
  return false;
}
