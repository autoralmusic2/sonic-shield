import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
  ],
  server: {
    port: 8080,
    host: true,
    strictPort: true,
    // historyApiFallback equivalent: serve index.html for non-asset routes so
    // client-side route aliases (/login, /minutas, etc.) never 404 on refresh.
    historyApiFallback: true,
  },
  preview: {
    port: 8080,
    host: true,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
