import { useState } from "react";
import { describeAction } from "~/lib/actions";
import type { Enemy } from "~/types";
import { RulesText } from "./RulesText";
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
  className = "",
}: {
  enemy: Enemy;
  roll?: number;
  status?: string;
  columnStatus?: string;
  onRoll: (columnStatus: string) => void;
  onRemove?: () => void;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const description = describeAction(status, enemy.id);

  return (
    <article
      className={`overflow-hidden rounded border border-bf-edge bg-bf-slate ${className}`}
    >
      {/* Head strip mirrors the printed twist card: eyebrow, hairline, title. */}
      <div className="bf-gradient-head border-b border-bf-edge px-4 pt-2.5 pb-3">
        <div className="flex items-start justify-between gap-2 border-b border-white/15 pb-1.5">
          <span className="bf-eyebrow text-bf-kicker">Hostile</span>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${enemy.name} from this group`}
              title={`Remove ${enemy.name} from this group`}
              className="-mt-1 -mr-1 rounded p-1 text-white/60 transition hover:bg-black/30 hover:text-white focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none"
            >
              <TrashIcon />
            </button>
          )}
        </div>

        <h2 className="pt-1.5 text-xl text-bf-cyan md:text-2xl">{enemy.name}</h2>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="bf-eyebrow mb-1.5 text-bf-muted">Situation</p>

          <div className="flex flex-wrap gap-1.5">
            {enemy.columns.map((column) => {
              const active = columnStatus === column.status;
              return (
                <button
                  key={column.status}
                  type="button"
                  onClick={() => onRoll(column.status)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1 font-cond text-xs tracking-wider uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none ${
                    active
                      ? "border-bf-cyan bg-bf-cyan/10 text-bf-cyan"
                      : "border-bf-edge text-bf-text hover:border-bf-cyan hover:text-bf-bright"
                  }`}
                >
                  {column.status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-bf-edge pt-3">
          <p className="bf-eyebrow text-bf-muted" aria-live="polite">
            Roll <span className="ml-1 font-body text-sm tabular-nums text-bf-bright">{roll ?? "—"}</span>
          </p>
          <p className="font-cond text-lg leading-tight text-bf-cyan md:text-xl">
            {status ?? ""}
          </p>
        </div>

        {status && (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            className={`rounded border border-bf-edge bg-bf-slate-2 p-3 text-left text-sm transition hover:border-bf-cyan/50 focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none ${
              collapsed ? "h-12 overflow-hidden" : "h-auto"
            }`}
          >
            {description ? (
              <RulesText text={description} />
            ) : (
              <span className="text-bf-muted italic">No rules text found.</span>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
