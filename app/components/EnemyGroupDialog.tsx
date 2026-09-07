import { useGame } from "~/store/GameProvider";
import { EnemyChooser } from "./EnemyChooser";
import { GroupCards } from "./GroupCards";
import { PickerDialog } from "./PickerDialog";

/**
 * Roll a group's behaviour charts, and adjust its roster, without leaving the arena.
 * Replaces navigating to /enemygroup/:n, which is still reachable directly.
 */
export function EnemyGroupDialog({
  group,
  onClose,
}: {
  group: number | null;
  onClose: () => void;
}) {
  const { state } = useGame();

  return (
    <PickerDialog
      open={group !== null}
      title={group === null ? "" : (state.groups[group]?.name ?? `Group ${group}`)}
      hint="Pick the situation each hostile is in to roll its behaviour chart."
      size="lg"
      surface="dark"
      closeLabel="Done"
      onClose={onClose}
    >
      {group !== null && (
        <>
          <GroupCards group={group} />

          <section className="mt-4 border-t border-white/15 pt-4">
            <h3 className="mb-2 text-sm text-white/80">
              Add hostiles
              <span className="ml-2 font-normal opacity-70">
                click to add, again for another copy
              </span>
            </h3>
            <EnemyChooser group={group} />
          </section>
        </>
      )}
    </PickerDialog>
  );
}
