import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 750,
  },
  optimizeDeps: {
    exclude: ["lucide-react", "lucide-react/dist/esm/Icon.mjs"],
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      config: {
        main: "./worker/index.ts",
        compatibility_flags: ["nodejs_compat"],
      },
    }),
  ],
});
