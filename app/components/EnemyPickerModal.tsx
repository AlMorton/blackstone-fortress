import { EnemyChooser } from "./EnemyChooser";
import { PickerDialog } from "./PickerDialog";

/** Hostile picker for a single, already-chosen group (used on the group page). */
export function EnemyPickerModal({
  group,
  onClose,
}: {
  group: number | null;
  onClose: () => void;
}) {
  return (
    <PickerDialog
      open={group !== null}
      title={group === null ? "" : `Add To Group ${group}`}
      hint="Click to add. Click again to add another — each copy rolls independently."
      onClose={onClose}
    >
      {group !== null && <EnemyChooser group={group} />}
    </PickerDialog>
  );
}
