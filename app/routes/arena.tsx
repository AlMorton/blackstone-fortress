import { useState } from "react";
import { Link } from "react-router";
import { ListIcon } from "~/components/icons";
import { EnemyGroupDialog } from "~/components/EnemyGroupDialog";
import { InitiativeTrack } from "~/components/InitiativeTrack";
import { getEnemy } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";

export function meta() {
  return [{ title: "Arena | Blackstone Fortress" }];
}

export default function Arena() {
  const { state } = useGame();
  const [openGroup, setOpenGroup] = useState<number | null>(null);

  const populated = Object.values(state.groups).filter(
    (group) => group.members.length > 0,
  );

  return (
    <div className="w-full">
      <InitiativeTrack onOpenGroup={setOpenGroup} />

      <div className="mb-2 flex justify-end">
        <Link
          to="/enemies"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 underline decoration-white/30 transition hover:text-white hover:decoration-white"
        >
          <ListIcon />
          Behaviour chart reference
        </Link>
      </div>

      <h2 className="bf-gradient-panel mt-2 flex h-10 items-center justify-center rounded-[10px] text-white">
        Enemy Groups
      </h2>

      <div className="mt-2 flex flex-row flex-wrap">
        {populated.length === 0 && (
          <p className="p-2 opacity-70">
            No groups yet — use Add Enemy Group to place hostiles.
          </p>
        )}

        {populated.map((group) => (
          <div
            key={group.number}
            className="m-1.5 flex min-h-[70px] max-w-[150px] flex-1 basis-[150px] rounded-[10px] border border-bf-pink-edge"
          >
            <button
              type="button"
              onClick={() => setOpenGroup(group.number)}
              className="bf-gradient-enemy m-1.5 flex-1 cursor-pointer rounded-[10px] p-1.5 text-left"
            >
              <span className="text-base text-white">{group.name}</span>
              {group.members.map((member) => (
                <p key={member.instanceId} className="m-0 p-0 text-[0.7rem]">
                  {getEnemy(member.enemyId).name}
                </p>
              ))}
            </button>
          </div>
        ))}
      </div>

      <EnemyGroupDialog group={openGroup} onClose={() => setOpenGroup(null)} />
    </div>
  );
}
