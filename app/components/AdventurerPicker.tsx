import { ADVENTURERS } from "~/lib/adventurers";
import { useGame } from "~/store/GameProvider";
import { PickerDialog } from "./PickerDialog";

/** Explorer picker. Selected explorers sit on the initiative track. */
export function AdventurerPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toggleAdventurer, isOnTrack } = useGame();

  return (
    <PickerDialog
      open={open}
      title="Add Player"
      hint="Click an explorer to put them on the initiative track. Click again to remove."
      onClose={onClose}
    >
      {ADVENTURERS.map((name) => {
        const selected = isOnTrack(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => toggleAdventurer(name)}
            aria-pressed={selected}
            className={`min-w-10 rounded-[50px] px-3 py-1.5 text-sm transition ${
              selected
                ? "bf-gradient-selected text-white ring-2 ring-bf-cyan"
                : "bg-black/35 text-white/70 hover:bg-black/50 hover:text-white"
            }`}
          >
            <span aria-hidden="true" className="mr-1.5 opacity-90">
              {selected ? "\u2713" : "+"}
            </span>
            {name}
          </button>
        );
      })}
    </PickerDialog>
  );
}
