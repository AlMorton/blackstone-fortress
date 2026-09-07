import { Link } from "react-router";
import { enemies } from "~/lib/enemies";

export function meta() {
  return [{ title: "Enemies | Blackstone Fortress" }];
}

/** Reference list of every hostile and its full behaviour chart. */
export default function Enemies() {
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

      <div className="flex flex-row flex-wrap">
        {enemies.map((enemy) => (
          <article
            key={enemy.id}
            className="bf-gradient-blue m-0.5 w-full rounded p-4 text-bf-card md:w-[calc(50%-0.25rem)]"
          >
            <h2 className="text-xl md:text-2xl">{enemy.name}</h2>

            <div className="mt-3 grid gap-3">
              {enemy.columns.map((column) => (
                <div key={column.status}>
                  <h3 className="text-bf-cyan">{column.status}</h3>
                  <ul className="mt-1 text-sm">
                    {column.actions.map((range) => (
                      <li
                        key={`${range.from}-${range.to}`}
                        className="flex gap-3"
                      >
                        <span className="w-14 shrink-0 tabular-nums opacity-70">
                          {range.from === range.to
                            ? range.from
                            : `${range.from}-${range.to}`}
                        </span>
                        <span>{range.actionTaken}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
