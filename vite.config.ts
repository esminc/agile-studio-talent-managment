import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { amplifyHosting } from "vite-plugin-react-router-amplify-hosting";

export default defineConfig({
  plugins: [
    tailwindcss(),
    !process.env.VITEST && reactRouter(),
    amplifyHosting(),
    tsconfigPaths(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
  optimizeDeps: {
    exclude: [
      "@aws-amplify/backend",
      "@aws-amplify/backend-auth",
      "@aws-amplify/backend-data",
      "@aws-amplify/backend-function",
      "@aws-amplify/backend-storage",
    ],
  },
  build: {
    rollupOptions: {
      external: [
        "@aws-amplify/backend",
        "@aws-amplify/backend-auth",
        "@aws-amplify/backend-data",
        "@aws-amplify/backend-function",
        "@aws-amplify/backend-storage",
      ],
    },
  },
});
