import { ADVENTURERS } from "~/lib/adventurers";
import { useGame } from "~/store/GameProvider";
import { PickerDialog } from "./PickerDialog";

/** Explorer picker. Selected explorers sit on the initiative track. */
export function AdventurerPicker({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toggleAdventurer, isOnTrack } = useGame();

  return (
    <PickerDialog
      open={open}
      title="Add Player"
      hint="Click an explorer to put them on the initiative track. Click again to remove."
      onClose={onClose}
    >
      <div className="flex flex-wrap gap-1.5">
        {ADVENTURERS.map((name) => {
          const selected = isOnTrack(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleAdventurer(name)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1 font-cond text-xs tracking-wider uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none ${
                selected ? "border-bf-cyan bg-bf-cyan/10 text-bf-cyan" : "border-bf-edge text-bf-text hover:border-bf-cyan hover:text-bf-bright"
              }`}
            >
              <span aria-hidden="true" className="mr-1.5 opacity-90">
                {selected ? "\u2713" : "+"}
              </span>
              {name}
            </button>
          );
        })}
      </div>
    </PickerDialog>
  );
}
