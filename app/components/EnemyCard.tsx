import { useState } from "react";
import { describeAction } from "~/lib/actions";
import { getEnemy } from "~/lib/enemies";
import { TrashIcon } from "./icons";
import { useGame } from "~/store/GameProvider";
import type { EnemyInstance } from "~/types";

/**
 * One hostile in a group: the behaviour-chart columns as buttons, the last roll, and
 * the rules text for the resolved action.
 */
export function EnemyCard({
  group,
  member,
  showRemove = true,
}: {
  group: number;
  member: EnemyInstance;
  showRemove?: boolean;
}) {
  const { rollFor, removeInstance } = useGame();
  const [collapsed, setCollapsed] = useState(false);
  const enemy = getEnemy(member.enemyId);
  const description = describeAction(member.status);

  return (
    <article className="bf-gradient-blue relative m-0.5 w-full rounded text-bf-card md:w-[calc(50%-0.25rem)]">
      <div className="p-4">
        <h2 className="pr-8 text-xl md:text-2xl">{enemy.name}</h2>

        {showRemove && (
          <button
            type="button"
            onClick={() => removeInstance(group, member.instanceId)}
            aria-label={`Remove ${enemy.name} from this group`}
            title={`Remove ${enemy.name} from this group`}
            className="absolute top-2 right-2 rounded p-1 text-white/60 transition hover:bg-black/30 hover:text-white"
          >
            <TrashIcon />
          </button>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {enemy.columns.map((column) => (
            <button
              key={column.status}
              type="button"
              onClick={() => rollFor(group, member.instanceId, column.status)}
              aria-pressed={member.columnStatus === column.status}
              className={`rounded bg-bf-btn px-3 py-1.5 text-sm text-white transition hover:brightness-125 ${
                member.columnStatus === column.status
                  ? "ring-1 ring-bf-cyan"
                  : ""
              }`}
            >
              {column.status}
            </button>
          ))}
        </div>

        <div className="flex items-baseline justify-between pt-4">
          <h4 className="text-base md:text-lg" aria-live="polite">
            Dice roll: {member.roll ?? 0}
          </h4>
          <h4 className="text-base text-bf-cyan md:text-lg">
            {member.status ?? ""}
          </h4>
        </div>

        {member.status && (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            className={`mt-2 w-full rounded-[10px] border border-bf-green bg-bf-panel p-4 text-left ${
              collapsed ? "h-12 overflow-hidden" : "h-auto"
            }`}
          >
            <p>
              {description || (
                <span className="italic opacity-70">No rules text found.</span>
              )}
            </p>
          </button>
        )}
      </div>
    </article>
  );
}
