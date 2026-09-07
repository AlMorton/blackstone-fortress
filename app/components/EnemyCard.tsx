import { getEnemy } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";
import type { EnemyInstance } from "~/types";
import { BehaviourCard } from "./BehaviourCard";

/** A hostile in a group. Roll state lives in the store, so it survives a reload. */
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
  const enemy = getEnemy(member.enemyId);

  return (
    <BehaviourCard
      enemy={enemy}
      roll={member.roll}
      status={member.status}
      columnStatus={member.columnStatus}
      onRoll={(columnStatus) => rollFor(group, member.instanceId, columnStatus)}
      onRemove={
        showRemove ? () => removeInstance(group, member.instanceId) : undefined
      }
      className="m-0.5 w-full md:w-[calc(50%-0.25rem)]"
    />
  );
}
