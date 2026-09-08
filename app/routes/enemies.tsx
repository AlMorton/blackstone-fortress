import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { BehaviourCard } from "~/components/BehaviourCard";
import { ChevronIcon } from "~/components/icons";
import { resolveAction } from "~/lib/behaviour";
import { rollD20 } from "~/lib/dice";
import { enemies, getEnemy } from "~/lib/enemies";

export function meta() {
  return [{ title: "Enemies | Blackstone Fortress" }];
}

interface Result {
  roll: number;
  status: string;
  columnStatus: string;
}

/**
 * Every hostile as a row. Picking one swaps the list for its rollable behaviour card;
 * Done swaps back. A full-page view rather than a dialog suits the card once its rules
 * text is showing, at the cost of having to move focus by hand — a dialog would have
 * done that for us.
 */
export default function Enemies() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** Set when returning to the list, so focus can go back to the row just left. */
  const returningTo = useRef<string | null>(null);

  const enemy = openId ? getEnemy(openId) : null;

  useEffect(() => {
    if (openId) {
      doneRef.current?.focus();
      return;
    }
    const id = returningTo.current;
    if (!id) return;
    returningTo.current = null;
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-enemy-row="${id}"]`)
      ?.focus();
  }, [openId]);

  function open(id: string) {
    setOpenId(id);
    // A look-up roll is throwaway, so each hostile opens with a clean card.
    setResult(null);
  }

  function close() {
    returningTo.current = openId;
    setOpenId(null);
  }

  function roll(columnStatus: string) {
    if (!enemy) return;
    const column = enemy.columns.find((c) => c.status === columnStatus);
    if (!column) return;
    const value = rollD20();
    setResult({ roll: value, status: resolveAction(column, value), columnStatus });
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-baseline gap-4 border-b border-bf-edge pb-2">
        <h1 className="text-2xl text-bf-bright">Behaviour charts</h1>
        <Link
          to="/"
          className="font-cond text-sm tracking-wide uppercase text-bf-muted underline decoration-bf-edge transition hover:text-bf-cyan hover:decoration-bf-cyan"
        >
          Back to the arena
        </Link>
      </div>

      {enemy ? (
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <button
              ref={doneRef}
              type="button"
              onClick={close}
              className="rounded border px-4 py-2 font-cond text-sm tracking-wide uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none border-bf-edge bg-bf-slate text-bf-bright hover:border-bf-cyan hover:text-bf-cyan"
            >
              Done
            </button>
            <p className="text-sm text-bf-muted">
              Pick the situation this hostile is in to roll its behaviour chart.
            </p>
          </div>

          <BehaviourCard
            enemy={enemy}
            roll={result?.roll}
            status={result?.status}
            columnStatus={result?.columnStatus}
            onRoll={roll}
            className="w-full"
          />
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-bf-muted">
            Pick a hostile to roll its behaviour chart without adding it to a group.
          </p>

          <ul
            ref={listRef}
            className="max-w-2xl overflow-hidden rounded border border-bf-edge bg-bf-slate"
          >
            {enemies.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  data-enemy-row={item.id}
                  onClick={() => open(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-bf-cyan/8 focus-visible:bg-bf-cyan/8 focus-visible:outline-none ${
                    index > 0 ? "border-t border-bf-edge" : ""
                  }`}
                >
                  <span className="flex-1 font-cond text-bf-bright">{item.name}</span>
                  <span className="text-xs text-bf-muted">
                    {item.columns.length} situations
                  </span>
                  <span className="text-bf-cyan">
                    <ChevronIcon />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
