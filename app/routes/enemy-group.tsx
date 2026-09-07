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
      <div className="p-4 text-white">
        <h1 className="text-xl">No such group</h1>
        <Link to="/" className="mt-2 inline-block underline">
          Back to the arena
        </Link>
      </div>
    );
  }

  const group = state.groups[groupNumber]!;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-baseline gap-4">
        <h1 className="text-xl text-white">{group.name}</h1>
        <Link
          to="/"
          className="text-sm text-white/70 underline decoration-white/30 transition hover:text-white hover:decoration-white"
        >
          Back to the arena
        </Link>
      </div>

      <p className="mb-3 text-sm opacity-80">
        Pick the situation each hostile is in to roll its behaviour chart.
      </p>

      <GroupCards group={groupNumber} />

      <section className="mt-4 border-t border-white/15 pt-4">
        <h2 className="mb-2 text-sm text-white/80">
          Add hostiles
          <span className="ml-2 font-normal opacity-70">
            click to add, again for another copy
          </span>
        </h2>
        <EnemyChooser group={groupNumber} />
      </section>
    </div>
  );
}
