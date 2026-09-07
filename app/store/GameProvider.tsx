import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { rollD20 } from "~/lib/dice";
import { createInitialState, gameReducer, type GameAction } from "./gameState";
import { loadState, saveState } from "./persistence";
import type { GameState } from "./types";

/**
 * Replaces the scoped EnemyService from the Blazor app's DI container: one instance of
 * the game state for the whole session, shared by every route, persisted to
 * localStorage so a refresh does not lose the arena.
 */
interface GameContextValue {
  state: GameState;
  dispatch: (action: GameAction) => void;
  /** Rolls a d20 and records the resolved action for one hostile. */
  rollFor: (group: number, instanceId: string, columnStatus: string) => void;
  toggleAdventurer: (name: string) => void;
  addEnemy: (group: number, enemyId: string) => void;
  removeInstance: (group: number, instanceId: string) => void;
  isOnTrack: (name: string) => boolean;
  reset: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  /**
   * Restored in an effect rather than in the reducer initialiser: the root route is
   * rendered in Node at build time to produce index.html, where localStorage does not
   * exist, and reading it during the first client render would also desync hydration.
   */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restored = loadState();
    if (restored) dispatch({ type: "hydrate", state: restored });
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Skip until restore has run, or the empty initial state would overwrite it.
    if (!hydrated) return;
    saveState(state);
  }, [hydrated, state]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      rollFor: (group, instanceId, columnStatus) =>
        dispatch({ type: "roll", group, instanceId, columnStatus, roll: rollD20() }),
      toggleAdventurer: (name) => dispatch({ type: "toggleAdventurer", name }),
      addEnemy: (group, enemyId) => dispatch({ type: "addEnemy", group, enemyId }),
      removeInstance: (group, instanceId) =>
        dispatch({ type: "removeInstance", group, instanceId }),
      isOnTrack: (name) =>
        state.initiative.some((item) => item.kind === "adventurer" && item.id === name),
      // The save effect clears storage for us, since the reset state is empty.
      reset: () => dispatch({ type: "reset" }),
    }),
    [state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside <GameProvider>");
  return context;
}
