import { useState } from "react";
import { NavLink } from "react-router";
import { GridIcon, ListIcon, MenuIcon } from "./icons";

const LINK_BASE =
  "flex h-12 items-center gap-2 rounded px-3 text-bf-nav transition-colors hover:bg-white/10 hover:text-white";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <aside
      className={`bf-gradient-sidebar shrink-0 md:sticky md:top-0 md:h-screen ${
        collapsed ? "md:w-20" : "md:w-[260px]"
      }`}
    >
      <div className="flex h-14 items-center gap-3 bg-black/40 px-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden cursor-pointer text-white md:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <MenuIcon />
        </button>

        {!collapsed && (
          <NavLink to="/" className="text-[1.1rem] text-white">
            Blackstone Fortress
          </NavLink>
        )}

        <button
          type="button"
          onClick={() => setNavOpen((value) => !value)}
          className="ml-auto rounded bg-white/10 p-2 text-white md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
        >
          <MenuIcon />
        </button>
      </div>

      <nav className={`${navOpen ? "block" : "hidden"} px-3 py-4 md:block`}>
        <ul className="flex flex-col gap-2">
          <li>
            <NavLink
              to="/"
              end
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `${LINK_BASE} ${isActive ? "bg-white/25 text-white" : ""}`
              }
            >
              <GridIcon />
              <span className={collapsed ? "md:hidden" : ""}>Arena</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/enemies"
              end
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `${LINK_BASE} ${isActive ? "bg-white/25 text-white" : ""}`
              }
            >
              <ListIcon />
              <span className={collapsed ? "md:hidden" : ""}>Enemies</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
