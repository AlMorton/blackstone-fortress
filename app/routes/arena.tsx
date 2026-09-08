import { Link, useNavigate } from "react-router";
import { ChevronIcon, ListIcon } from "~/components/icons";
import { InitiativeTrack } from "~/components/InitiativeTrack";
import { getEnemy } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";

export function meta() {
  return [{ title: "Arena | Blackstone Fortress" }];
}

export default function Arena() {
  const { state } = useGame();
  const navigate = useNavigate();

  const populated = Object.values(state.groups).filter(
    (group) => group.members.length > 0,
  );

  return (
    <div className="w-full">
      {/* The page had no top-level heading; the two section headings sit under this. */}
      <h1 className="sr-only">Arena</h1>

      <InitiativeTrack
        onOpenGroup={(group) => navigate(`/enemygroup/${group}`)}
        actions={
          <Link
            to="/enemies"
            className="inline-flex items-center gap-1.5 rounded border border-bf-edge px-4 py-2 font-cond text-sm tracking-wide text-bf-muted uppercase transition hover:border-bf-cyan hover:text-bf-cyan focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none"
          >
            <ListIcon />
            Behaviour chart reference
          </Link>
        }
      />

      <h2 className="bf-eyebrow border-b border-bf-edge pb-2 text-bf-kicker mt-6">Enemy Groups</h2>

      <div className="mt-2 flex flex-row flex-wrap">
        {populated.length === 0 && (
          <p className="p-2 text-bf-muted">
            No groups yet — use Add Enemy Group to place hostiles.
          </p>
        )}

        {populated.map((group) => (
          <div
            key={group.number}
            className="m-1.5 flex min-h-[70px] max-w-[160px] flex-1 basis-[160px] rounded border border-bf-pink-edge"
          >
            <button
              type="button"
              onClick={() => navigate(`/enemygroup/${group.number}`)}
              className="bf-gradient-enemy m-1.5 flex-1 cursor-pointer rounded p-1.5 text-left"
            >
              <span className="font-cond text-base text-bf-bright">{group.name}</span>
              {group.members.map((member) => (
                <p key={member.instanceId} className="m-0 p-0 text-[0.7rem]">
                  {getEnemy(member.enemyId).name}
                </p>
              ))}
              <span className="mt-1 inline-flex items-center gap-0.5 font-cond text-[0.65rem] tracking-wide uppercase text-bf-cyan">
                Roll behaviour
                <ChevronIcon />
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
