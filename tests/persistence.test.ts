import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState, gameReducer } from "../app/store/gameState";
import { deserialize, isEmpty, serialize } from "../app/store/persistence";
import type { GameState } from "../app/store/types";

let counter = 0;
beforeEach(() => {
  counter = 0;
  vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(
    () => `id-${++counter}` as `${string}-${string}-${string}-${string}-${string}`,
  );
});

/** An arena with one explorer and a group holding two of the same hostile. */
function populated(): GameState {
  let state = gameReducer(createInitialState(), {
    type: "toggleAdventurer",
    name: "Pious Vorne",
  });
  state = gameReducer(state, { type: "addEnemy", group: 2, enemyId: "ur-ghul" });
  state = gameReducer(state, { type: "addEnemy", group: 2, enemyId: "ur-ghul" });
  state = gameReducer(state, { type: "addEnemy", group: 5, enemyId: "traitor-guard" });
  return gameReducer(state, {
    type: "roll",
    group: 2,
    instanceId: state.groups[2]!.members[0]!.instanceId,
    columnStatus: "Engaged",
    roll: 20,
  });
}

const reload = (state: GameState) => deserialize(serialize(state));

describe("round trip", () => {
  it("restores groups, members, rolls and track order", () => {
    const before = populated();
    const after = reload(before)!;

    expect(after.initiative).toEqual(before.initiative);
    expect(after.groups[2]!.members).toEqual(before.groups[2]!.members);
    expect(after.groups[5]!.members).toEqual(before.groups[5]!.members);
    expect(after.groups[2]!.members[0]!.roll).toBe(20);
    expect(after.groups[2]!.members[0]!.status).toBe("Pounce");
  });

  it("keeps duplicates distinct", () => {
    const after = reload(populated())!;
    const ids = after.groups[2]!.members.map((m) => m.instanceId);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("leaves untouched groups empty", () => {
    const after = reload(populated())!;
    expect(after.groups[1]!.members).toEqual([]);
    expect(Object.keys(after.groups)).toHaveLength(8);
  });

  it("returns null for an empty arena, so nothing is restored", () => {
    expect(reload(createInitialState())).toBeNull();
  });
});

describe("rejecting unusable payloads", () => {
  it.each([
    ["null", null],
    ["empty string", ""],
    ["malformed JSON", "{not json"],
    ["a JSON array", "[]"],
    ["a bare number", "42"],
    ["no version", JSON.stringify({ groups: [], initiative: [] })],
    ["a future version", JSON.stringify({ version: 99, groups: [], initiative: [] })],
  ])("returns null for %s", (_label, raw) => {
    expect(deserialize(raw)).toBeNull();
  });
});

describe("sanitising stale data", () => {
  /**
   * The important case: an enemy id whose JSON has since been deleted would throw
   * from getEnemy during render, making the app unopenable until storage was cleared.
   */
  it("drops members whose enemy no longer exists", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [
        {
          number: 1,
          members: [
            { instanceId: "a", enemyId: "ur-ghul" },
            { instanceId: "b", enemyId: "space-hamster" },
          ],
        },
      ],
      initiative: [{ kind: "group", group: 1 }],
    });

    const restored = deserialize(raw)!;
    expect(restored.groups[1]!.members.map((m) => m.enemyId)).toEqual(["ur-ghul"]);
  });

  it("returns null when dropping unknown enemies empties the arena", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [{ number: 1, members: [{ instanceId: "a", enemyId: "space-hamster" }] }],
      initiative: [{ kind: "group", group: 1 }],
    });
    expect(deserialize(raw)).toBeNull();
  });

  it("drops explorers who are not in the roster", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [],
      initiative: [
        { kind: "adventurer", id: "Pious Vorne" },
        { kind: "adventurer", id: "Gandalf" },
      ],
    });
    expect(deserialize(raw)!.initiative).toEqual([
      { kind: "adventurer", id: "Pious Vorne" },
    ]);
  });

  it.each([
    ["out-of-range groups", { number: 99, members: [{ instanceId: "a", enemyId: "cultist" }] }],
    ["fractional groups", { number: 1.5, members: [{ instanceId: "a", enemyId: "cultist" }] }],
  ])("ignores %s", (_label, group) => {
    const raw = JSON.stringify({
      version: 1,
      groups: [group, { number: 3, members: [{ instanceId: "b", enemyId: "cultist" }] }],
      initiative: [{ kind: "group", group: 3 }],
    });
    const restored = deserialize(raw)!;
    expect(restored.groups[3]!.members).toHaveLength(1);
    expect(Object.values(restored.groups).flatMap((g) => g.members)).toHaveLength(1);
  });

  it("drops malformed members and track entries", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [
        {
          number: 1,
          members: [
            { instanceId: "", enemyId: "cultist" },
            { instanceId: "ok", enemyId: "cultist" },
            { instanceId: "bad-roll", enemyId: "cultist", roll: "twenty" },
            null,
          ],
        },
      ],
      initiative: [{ kind: "group", group: 1 }, { kind: "wizard" }, null, "nope"],
    });

    const restored = deserialize(raw)!;
    expect(restored.groups[1]!.members.map((m) => m.instanceId)).toEqual(["ok"]);
    expect(restored.initiative).toEqual([{ kind: "group", group: 1 }]);
  });

  it("removes duplicate track entries", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [],
      initiative: [
        { kind: "adventurer", id: "UR-025" },
        { kind: "adventurer", id: "UR-025" },
      ],
    });
    expect(deserialize(raw)!.initiative).toEqual([{ kind: "adventurer", id: "UR-025" }]);
  });
});

describe("restoring the track invariant", () => {
  it("adds a populated group that was missing from the track", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [{ number: 4, members: [{ instanceId: "a", enemyId: "cultist" }] }],
      initiative: [{ kind: "adventurer", id: "Daedalosus" }],
    });
    expect(deserialize(raw)!.initiative).toEqual([
      { kind: "adventurer", id: "Daedalosus" },
      { kind: "group", group: 4 },
    ]);
  });

  it("removes a group from the track once its members are gone", () => {
    const raw = JSON.stringify({
      version: 1,
      groups: [],
      initiative: [
        { kind: "adventurer", id: "Daedalosus" },
        { kind: "group", group: 6 },
      ],
    });
    expect(deserialize(raw)!.initiative).toEqual([
      { kind: "adventurer", id: "Daedalosus" },
    ]);
  });
});

describe("isEmpty", () => {
  it("is true for a fresh arena and false once anything is placed", () => {
    expect(isEmpty(createInitialState())).toBe(true);
    expect(isEmpty(populated())).toBe(false);
  });

  it("is true again after a reset", () => {
    const state = gameReducer(populated(), { type: "reset" });
    expect(isEmpty(state)).toBe(true);
  });
});
