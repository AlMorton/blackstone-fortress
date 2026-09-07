import { useGame } from "~/store/GameProvider";
import { GroupCards } from "./GroupCards";
import { PickerDialog } from "./PickerDialog";

/**
 * Roll a group's behaviour charts without leaving the arena. Replaces navigating to
 * /enemygroup/:n, which is still reachable directly for a full-width view.
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
      title={
        group === null ? "" : (state.groups[group]?.name ?? `Group ${group}`)
      }
      hint="Pick the situation each hostile is in to roll its behaviour chart."
      size="lg"
      surface="dark"
      closeLabel="Done"
      onClose={onClose}
    >
      {group !== null && <GroupCards group={group} />}
    </PickerDialog>
  );
}
