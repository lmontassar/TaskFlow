import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8089/",
      "/ws": {
        target: "http://localhost:8089",
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, "/api/ws"),
      },
    },
  },
  define: {
    global: "window",
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
