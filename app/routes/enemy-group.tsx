import { Link } from "react-router";
import { EnemyChooser } from "~/components/EnemyChooser";
import { GroupCards } from "~/components/GroupCards";
import { GROUP_COUNT } from "~/store/gameState";
import { useGame } from "~/store/GameProvider";
import type { Route } from "./+types/enemy-group";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Group ${params.groupNumber} | Blackstone Fortress` }];
}

export default function EnemyGroupRoute({ params }: Route.ComponentProps) {
  const { state } = useGame();

  const groupNumber = Number(params.groupNumber);
  const valid =
    Number.isInteger(groupNumber) && groupNumber >= 1 && groupNumber <= GROUP_COUNT;

  if (!valid) {
    return (
      <div className="p-4">
        <h1 className="text-2xl text-bf-bright">No such group</h1>
        <Link to="/" className="mt-2 inline-block underline">
          Back to the arena
        </Link>
      </div>
    );
  }

  const group = state.groups[groupNumber]!;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-baseline gap-4 border-b border-bf-edge pb-2">
        <h1 className="text-2xl text-bf-bright">{group.name}</h1>
        <Link
          to="/"
          className="font-cond text-sm tracking-wide uppercase text-bf-muted underline decoration-bf-edge transition hover:text-bf-cyan hover:decoration-bf-cyan"
        >
          Back to the arena
        </Link>
      </div>

      <p className="mb-3 text-sm text-bf-muted">
        Pick the situation each hostile is in to roll its behaviour chart.
      </p>

      <GroupCards group={groupNumber} />

      <section className="mt-6 border-t border-bf-edge pt-4">
        <h2 className="bf-eyebrow border-b border-bf-edge pb-2 text-bf-kicker mb-3">
          Add hostiles
          <span className="ml-2 tracking-normal normal-case text-bf-muted">
            click to add, again for another copy
          </span>
        </h2>
        <EnemyChooser group={groupNumber} />
      </section>
    </div>
  );
}
