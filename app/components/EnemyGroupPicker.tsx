import { useState } from "react";
import { GROUP_COUNT } from "~/store/gameState";
import { useGame } from "~/store/GameProvider";
import { EnemyChooser } from "./EnemyChooser";
import { PickerDialog } from "./PickerDialog";

const GROUPS = Array.from({ length: GROUP_COUNT }, (_, i) => i + 1);

/**
 * Pick a group, then fill it — both in one popup, so adding hostiles never chains two
 * dialogs together. Replaces the arena's inline "Select Enemy Groups" panel.
 */
export function EnemyGroupPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame();
  const [active, setActive] = useState(1);

  return (
    <PickerDialog
      open={open}
      title="Add Enemy Group"
      hint="Pick a group, then click hostiles to add them. Click again to add another — each copy rolls independently."
      onClose={onClose}
    >
      <div className="w-full">
        <div
          role="tablist"
          aria-label="Enemy group"
          className="flex flex-wrap gap-1 border-b border-white/20 pb-3"
        >
          {GROUPS.map((group) => {
            const count = state.groups[group]?.members.length ?? 0;
            const selected = group === active;
            return (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(group)}
                className={`min-w-10 rounded px-3 py-1.5 text-sm transition ${
                  selected
                    ? "bf-gradient-selected text-white ring-2 ring-bf-cyan"
                    : count > 0
                      ? "bf-gradient-enemy text-white"
                      : "bg-black/35 text-white/70 hover:bg-black/50 hover:text-white"
                }`}
              >
                {group}
                {count > 0 && <span className="ml-1.5 opacity-90">·{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="pt-3">
          <EnemyChooser group={active} />
        </div>
      </div>
    </PickerDialog>
  );
}
