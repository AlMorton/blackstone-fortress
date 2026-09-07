import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/arena.tsx"),
  route("enemies", "routes/enemies.tsx"),
  route("enemygroup/:groupNumber", "routes/enemy-group.tsx"),
] satisfies RouteConfig;
