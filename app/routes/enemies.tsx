import { useState } from "react";
import { Link } from "react-router";
import { BehaviourCard } from "~/components/BehaviourCard";
import { ChevronIcon } from "~/components/icons";
import { PickerDialog } from "~/components/PickerDialog";
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

/** Every hostile as a row; picking one opens its rollable behaviour card. */
export default function Enemies() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const enemy = openId ? getEnemy(openId) : null;

  function open(id: string) {
    setOpenId(id);
    // A look-up roll is throwaway, so each hostile opens with a clean card.
    setResult(null);
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
      <div className="mb-3 flex flex-wrap items-baseline gap-4">
        <h1 className="text-xl text-white">Behaviour charts</h1>
        <Link
          to="/"
          className="text-sm text-white/70 underline decoration-white/30 transition hover:text-white hover:decoration-white"
        >
          Back to the arena
        </Link>
      </div>

      <p className="mb-3 text-sm opacity-80">
        Pick a hostile to roll its behaviour chart without adding it to a group.
      </p>

      <ul className="max-w-2xl overflow-hidden rounded-[10px] border border-white/15">
        {enemies.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(item.id)}
              className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none ${
                index > 0 ? "border-t border-white/10" : ""
              }`}
            >
              <span className="flex-1 text-white">{item.name}</span>
              <span className="text-xs text-white/50">
                {item.columns.length} situations
              </span>
              <span className="text-bf-cyan">
                <ChevronIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <PickerDialog
        open={enemy !== null}
        title={enemy?.name ?? ""}
        hint="Pick the situation this hostile is in to roll its behaviour chart."
        surface="dark"
        // Not "Close" — that collides with the Close situation button on the card.
        closeLabel="Done"
        onClose={() => setOpenId(null)}
      >
        {enemy && (
          <BehaviourCard
            enemy={enemy}
            roll={result?.roll}
            status={result?.status}
            columnStatus={result?.columnStatus}
            onRoll={roll}
            showName={false}
            className="w-full"
          />
        )}
      </PickerDialog>
    </div>
  );
}
