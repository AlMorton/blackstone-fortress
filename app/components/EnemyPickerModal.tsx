import { useEffect, useRef } from "react";
import { enemies } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";

/**
 * Built on <dialog> so the browser handles focus trapping, Escape-to-close and
 * inertness of the page behind. The Blazor version hardcoded aria-hidden="true" on
 * the modal root, which hid the whole picker from assistive technology.
 */
export function EnemyPickerModal({
  group,
  onClose,
}: {
  group: number | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { state, addEnemy, removeInstance } = useGame();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (group !== null && !dialog.open) dialog.showModal();
    if (group === null && dialog.open) dialog.close();
  }, [group]);

  if (group === null) return null;

  const members = state.groups[group]?.members ?? [];
  const countOf = (enemyId: string) =>
    members.filter((member) => member.enemyId === enemyId).length;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="enemy-picker-title"
      className="m-auto w-[min(42rem,92vw)] rounded bg-transparent p-0 backdrop:bg-black/60"
    >
      <div className="bf-gradient-modal rounded text-bf-card">
        <header className="border-b border-white/20 px-4 py-3">
          <h2 id="enemy-picker-title" className="text-lg text-white">
            Add To Group {group}
          </h2>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          <p className="mb-3 text-sm opacity-80">
            Click to add. Click again to add another — each copy rolls independently.
          </p>
          <div className="flex flex-wrap gap-1">
            {enemies.map((enemy) => {
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
          </div>
        </div>

        <footer className="flex justify-end border-t border-white/20 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-bf-btn px-5 py-2 text-white hover:brightness-125"
          >
            OK
          </button>
        </footer>
      </div>
    </dialog>
  );
}
