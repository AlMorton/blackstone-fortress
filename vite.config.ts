import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const appDir = fileURLToPath(new URL("./app", import.meta.url));

export default defineConfig(({ mode }) => ({
  // Must match `basename` in react-router.config.ts or every asset 404s on Pages.
  base: "/blackstone-fortress/",
  // The router plugin owns the app build; tests just need module resolution, and it
  // is the plugin that normally supplies the "~" alias, so set it explicitly here.
  plugins: mode === "test" ? [] : [reactRouter(), tailwindcss()],
  resolve: { alias: { "~": appDir } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
}));
