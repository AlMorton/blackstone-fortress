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
    <div className="flex flex-wrap gap-1.5">
      {enemies.map((enemy) => {
        const count = members.filter((member) => member.enemyId === enemy.id).length;
        return (
          <span key={enemy.id} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => addEnemy(group, enemy.id)}
              className={`rounded-full border px-3 py-1 font-cond text-xs tracking-wider uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none ${
                count > 0
                  ? "border-bf-pink-edge bg-bf-pink/20 text-bf-bright"
                  : "border-bf-edge text-bf-text hover:border-bf-cyan hover:text-bf-bright"
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
                className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-bf-edge text-base leading-none text-bf-text transition hover:border-bf-cyan hover:text-bf-cyan focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none"
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
