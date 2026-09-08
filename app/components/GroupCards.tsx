import { useGame } from "~/store/GameProvider";
import { EnemyCard } from "./EnemyCard";

/** The behaviour cards for one enemy group. Shared by the popup and the group route. */
export function GroupCards({ group }: { group: number }) {
  const { state } = useGame();
  const members = state.groups[group]?.members ?? [];

  if (members.length === 0) {
    return <p className="text-bf-muted">This group is empty.</p>;
  }

  return (
    <div className="flex flex-row flex-wrap items-start">
      {members.map((member) => (
        <EnemyCard key={member.instanceId} group={group} member={member} />
      ))}
    </div>
  );
}
