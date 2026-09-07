import { useState } from "react";
import { Link } from "react-router";
import { GroupCards } from "~/components/GroupCards";
import { EnemyPickerModal } from "~/components/EnemyPickerModal";
import { GROUP_COUNT } from "~/store/gameState";
import { useGame } from "~/store/GameProvider";
import type { Route } from "./+types/enemy-group";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Group ${params.groupNumber} | Blackstone Fortress` }];
}

export default function EnemyGroupRoute({ params }: Route.ComponentProps) {
  const { state } = useGame();
  const [pickerOpen, setPickerOpen] = useState(false);

  const groupNumber = Number(params.groupNumber);
  const valid =
    Number.isInteger(groupNumber) &&
    groupNumber >= 1 &&
    groupNumber <= GROUP_COUNT;

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
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h1 className="text-xl text-white">{group.name}</h1>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="rounded bg-bf-btn px-4 py-1.5 text-sm text-white hover:brightness-125"
        >
          Add hostiles
        </button>
        <Link to="/" className="text-sm underline opacity-80 hover:opacity-100">
          Back to the arena
        </Link>
      </div>

      <GroupCards group={groupNumber} />

      <EnemyPickerModal
        group={pickerOpen ? groupNumber : null}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
