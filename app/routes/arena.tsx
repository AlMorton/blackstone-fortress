import { useState } from "react";
import { useNavigate } from "react-router";
import { EnemyPickerModal } from "~/components/EnemyPickerModal";
import { ExpandPanel } from "~/components/ExpandPanel";
import { InitiativeTrack } from "~/components/InitiativeTrack";
import { getEnemy } from "~/lib/enemies";
import { GROUP_COUNT } from "~/store/gameState";
import { useGame } from "~/store/GameProvider";

export function meta() {
  return [{ title: "Arena | Blackstone Fortress" }];
}

export default function Arena() {
  const { state } = useGame();
  const navigate = useNavigate();
  const [pickerGroup, setPickerGroup] = useState<number | null>(null);

  const populated = Object.values(state.groups).filter((group) => group.members.length > 0);

  return (
    <div className="w-full">
      <InitiativeTrack />

      <ExpandPanel label="Select Enemy Groups">
        {Array.from({ length: GROUP_COUNT }, (_, i) => i + 1).map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setPickerGroup(group)}
            className="min-w-10 rounded bg-bf-btn px-3 py-1.5 text-white transition hover:brightness-125"
          >
            {group}
          </button>
        ))}
      </ExpandPanel>

      <h2 className="bf-gradient-panel mt-2 flex h-10 items-center justify-center rounded-[10px] text-white">
        Enemy Groups
      </h2>

      <div className="mt-2 flex flex-row flex-wrap">
        {populated.length === 0 && (
          <p className="p-2 opacity-70">No groups yet — pick a number above to add hostiles.</p>
        )}

        {populated.map((group) => (
          <div
            key={group.number}
            className="m-1.5 flex min-h-[70px] max-w-[150px] flex-1 basis-[150px] rounded-[10px] border border-bf-pink-edge"
          >
            <button
              type="button"
              onClick={() => navigate(`/enemygroup/${group.number}`)}
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

      <EnemyPickerModal group={pickerGroup} onClose={() => setPickerGroup(null)} />
    </div>
  );
}
