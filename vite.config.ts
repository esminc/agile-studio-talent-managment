import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";

export default defineConfig({
  ssr: {
    noExternal: Object.keys(pkg.dependencies),
  },
  plugins: [
    tailwindcss(),
    !process.env.VITEST && reactRouter(),
    tsconfigPaths(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
