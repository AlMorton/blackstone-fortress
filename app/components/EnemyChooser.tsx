import { enemies } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";

/**
 * The hostile list for one group: click to add, "−" to take one away. Shared by the
 * arena's group popup and the per-group page, so the two stay in step.
 */
export function EnemyChooser({ group }: { group: number }) {
  const { state, addEnemy, removeInstance } = useGame();
  const members = state.groups[group]?.members ?? [];

  return (
    <div className="flex flex-wrap gap-1">
      {enemies.map((enemy) => {
        const count = members.filter((member) => member.enemyId === enemy.id).length;
        return (
          <span key={enemy.id} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => addEnemy(group, enemy.id)}
              className={`min-w-10 rounded px-3 py-1.5 text-sm text-white transition ${
                count > 0
                  ? "bf-gradient-enemy border border-[#dc3545]"
                  : "bg-black/35 hover:bg-black/50"
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
  );
}
