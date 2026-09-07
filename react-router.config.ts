import type { Config } from "@react-router/dev/config";

/**
 * GitHub Pages serves static files only — no rewrites. Every route in this app is
 * enumerable (8 fixed enemy groups), so we prerender all of them to real HTML at real
 * paths. Pages then serves deep links with a 200 and no 404.html fallback is needed.
 */
const GROUP_PATHS = Array.from({ length: 8 }, (_, i) => `/enemygroup/${i + 1}`);

export default {
  ssr: false,
  basename: "/blackstone-fortress/",
  prerender: ["/", "/enemies", ...GROUP_PATHS],
} satisfies Config;
