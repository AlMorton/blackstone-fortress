import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState, gameReducer, GROUP_COUNT } from "../app/store/gameState";
import type { GameState } from "../app/store/types";

// Spy rather than replace the global: crypto's methods live on its prototype, so a
// spread copy would lose getRandomValues (which shuffle needs).
let counter = 0;
beforeEach(() => {
  counter = 0;
  vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(
    () => `id-${++counter}` as `${string}-${string}-${string}-${string}-${string}`,
  );
});
afterEach(() => vi.restoreAllMocks());

const add = (state: GameState, group: number, enemyId: string) =>
  gameReducer(state, { type: "addEnemy", group, enemyId });

describe("initial state", () => {
  it("creates the eight fixed groups, all empty", () => {
    const state = createInitialState();
    expect(Object.keys(state.groups)).toHaveLength(GROUP_COUNT);
    expect(Object.values(state.groups).every((g) => g.members.length === 0)).toBe(true);
    expect(state.initiative).toEqual([]);
  });
});

describe("adventurers", () => {
  it("toggles on and off the initiative track", () => {
    let state = gameReducer(createInitialState(), {
      type: "toggleAdventurer",
      name: "Pious Vorne",
    });
    expect(state.initiative).toEqual([{ kind: "adventurer", id: "Pious Vorne" }]);

    state = gameReducer(state, { type: "toggleAdventurer", name: "Pious Vorne" });
    expect(state.initiative).toEqual([]);
  });
});

describe("groups and the initiative track", () => {
  it("adds a group to the track as soon as it has a member", () => {
    const state = add(createInitialState(), 1, "traitor-guard");
    expect(state.groups[1]!.members).toHaveLength(1);
    expect(state.initiative).toEqual([{ kind: "group", group: 1 }]);
  });

  it("allows duplicates of the same enemy, each with its own instance", () => {
    let state = add(createInitialState(), 1, "ur-ghul");
    state = add(state, 1, "ur-ghul");
    state = add(state, 1, "ur-ghul");

    const ids = state.groups[1]!.members.map((m) => m.instanceId);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    // Still one track entry for the group, not three.
    expect(state.initiative).toEqual([{ kind: "group", group: 1 }]);
  });

  it("drops a group off the track when its last member is removed", () => {
    let state = add(createInitialState(), 2, "cultist");
    const [member] = state.groups[2]!.members;
    state = gameReducer(state, {
      type: "removeInstance",
      group: 2,
      instanceId: member!.instanceId,
    });

    expect(state.groups[2]!.members).toEqual([]);
    expect(state.initiative).toEqual([]);
  });

  it("keeps track order stable when another group is added", () => {
    let state = gameReducer(createInitialState(), {
      type: "toggleAdventurer",
      name: "Janus Drake",
    });
    state = add(state, 3, "ambull");
    state = add(state, 1, "cultist");

    expect(state.initiative).toEqual([
      { kind: "adventurer", id: "Janus Drake" },
      { kind: "group", group: 3 },
      { kind: "group", group: 1 },
    ]);
  });

  it("rejects an unknown enemy id", () => {
    expect(() => add(createInitialState(), 1, "space-hamster")).toThrow(/Unknown enemy id/);
  });
});

describe("rolling", () => {
  it("records the roll and resolved action on one instance only", () => {
    let state = add(createInitialState(), 1, "traitor-guard");
    state = add(state, 1, "traitor-guard");
    const [first, second] = state.groups[1]!.members;

    state = gameReducer(state, {
      type: "roll",
      group: 1,
      instanceId: first!.instanceId,
      columnStatus: "Engaged",
      roll: 20,
    });

    const [rolled, untouched] = state.groups[1]!.members;
    expect(rolled!.roll).toBe(20);
    expect(rolled!.status).toBe("Fury");
    expect(rolled!.columnStatus).toBe("Engaged");
    // The duplicate must not inherit the roll — this is the bug the Blazor app has.
    expect(untouched!.roll).toBeUndefined();
    expect(untouched!.status).toBeUndefined();
    expect(second!.instanceId).toBe(untouched!.instanceId);
  });

  it("does not let a roll in one group affect the same enemy in another", () => {
    let state = add(createInitialState(), 1, "traitor-guard");
    state = add(state, 2, "traitor-guard");

    state = gameReducer(state, {
      type: "roll",
      group: 1,
      instanceId: state.groups[1]!.members[0]!.instanceId,
      columnStatus: "Engaged",
      roll: 1,
    });

    expect(state.groups[1]!.members[0]!.status).toBe("Fall Back");
    expect(state.groups[2]!.members[0]!.status).toBeUndefined();
  });

  it("ignores a roll against a column the enemy does not have", () => {
    let state = add(createInitialState(), 1, "ur-ghul");
    const instanceId = state.groups[1]!.members[0]!.instanceId;

    state = gameReducer(state, {
      type: "roll",
      group: 1,
      instanceId,
      columnStatus: "In Cover",
      roll: 10,
    });

    expect(state.groups[1]!.members[0]!.status).toBeUndefined();
  });
});

describe("reordering", () => {
  const seed = () => {
    let state = createInitialState();
    for (const name of ["A", "B", "C"]) {
      state = gameReducer(state, { type: "toggleAdventurer", name });
    }
    return state;
  };
  const names = (state: GameState) =>
    state.initiative.map((item) => (item.kind === "adventurer" ? item.id : `g${item.group}`));

  it("moves an item to a new index", () => {
    expect(names(gameReducer(seed(), { type: "moveTrackItem", from: 0, to: 2 }))).toEqual([
      "B",
      "C",
      "A",
    ]);
  });

  it("is a no-op for out-of-range or identical indices", () => {
    const state = seed();
    expect(names(gameReducer(state, { type: "moveTrackItem", from: 1, to: 1 }))).toEqual([
      "A",
      "B",
      "C",
    ]);
    expect(names(gameReducer(state, { type: "moveTrackItem", from: 0, to: 9 }))).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("shuffling preserves membership", () => {
    const state = gameReducer(seed(), { type: "shuffleTrack" });
    expect([...names(state)].sort()).toEqual(["A", "B", "C"]);
  });
});
