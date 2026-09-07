import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { rollD20 } from "~/lib/dice";
import { createInitialState, gameReducer, type GameAction } from "./gameState";
import type { GameState } from "./types";

/**
 * Replaces the scoped EnemyService from the Blazor app's DI container: one instance of
 * the game state for the whole session, shared by every route.
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
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

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
