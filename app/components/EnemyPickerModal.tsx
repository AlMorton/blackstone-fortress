import { enemies } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";
import { PickerDialog } from "./PickerDialog";

/** Hostile picker for one enemy group. Adding the same enemy twice creates two instances. */
export function EnemyPickerModal({
  group,
  onClose,
}: {
  group: number | null;
  onClose: () => void;
}) {
  const { state, addEnemy, removeInstance } = useGame();

  const members = group === null ? [] : (state.groups[group]?.members ?? []);
  const countOf = (enemyId: string) =>
    members.filter((member) => member.enemyId === enemyId).length;

  return (
    <PickerDialog
      open={group !== null}
      title={`Add To Group ${group ?? ""}`.trim()}
      hint="Click to add. Click again to add another — each copy rolls independently."
      onClose={onClose}
    >
      {group !== null &&
        enemies.map((enemy) => {
          const count = countOf(enemy.id);
          return (
            <span key={enemy.id} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => addEnemy(group, enemy.id)}
                className={`min-w-10 rounded px-3 py-1.5 text-sm text-white transition ${
                  count > 0
                    ? "bf-gradient-enemy border border-[#dc3545]"
                    : "bg-bf-btn hover:brightness-125"
                }`}
              >
                {enemy.name}
                {count > 0 && <span className="ml-2 opacity-90">×{count}</span>}
              </button>

              {count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const last = [...members].reverse().find((m) => m.enemyId === enemy.id);
                    if (last) removeInstance(group, last.instanceId);
                  }}
                  aria-label={`Remove one ${enemy.name}`}
                  className="ml-0.5 rounded bg-black/40 px-2 py-1.5 text-sm text-white hover:bg-black/60"
                >
                  −
                </button>
              )}
            </span>
          );
        })}
    </PickerDialog>
  );
}
