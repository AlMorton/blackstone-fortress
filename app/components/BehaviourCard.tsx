import { useState } from "react";
import { describeAction } from "~/lib/actions";
import type { Enemy } from "~/types";
import { TrashIcon } from "./icons";

/**
 * Presentation for a rollable hostile: the behaviour-chart columns as buttons, the
 * last roll, and the rules text for the resolved action.
 *
 * Deliberately holds no roll state of its own. A hostile in a group reads it from the
 * store so it survives a reload, while the reference page keeps it in local state
 * because a look-up roll is throwaway.
 */
export function BehaviourCard({
  enemy,
  roll,
  status,
  columnStatus,
  onRoll,
  onRemove,
  showName = true,
  className = "",
}: {
  enemy: Enemy;
  roll?: number;
  status?: string;
  columnStatus?: string;
  onRoll: (columnStatus: string) => void;
  onRemove?: () => void;
  /** Off where a surrounding dialog already shows the name, to avoid repeating it. */
  showName?: boolean;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const description = describeAction(status);

  return (
    <article className={`bf-gradient-blue relative rounded text-bf-card ${className}`}>
      <div className="p-4">
        {showName && (
          <h2 className={`text-xl md:text-2xl ${onRemove ? "pr-8" : ""}`}>
            {enemy.name}
          </h2>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
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
              onClick={() => onRoll(column.status)}
              aria-pressed={columnStatus === column.status}
              className={`rounded bg-bf-btn px-3 py-1.5 text-sm text-white transition hover:brightness-125 ${
                columnStatus === column.status ? "ring-1 ring-bf-cyan" : ""
              }`}
            >
              {column.status}
            </button>
          ))}
        </div>

        <div className="flex items-baseline justify-between pt-4">
          <h4 className="text-base md:text-lg" aria-live="polite">
            Dice roll: {roll ?? 0}
          </h4>
          <h4 className="text-base text-bf-cyan md:text-lg">{status ?? ""}</h4>
        </div>

        {status && (
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
