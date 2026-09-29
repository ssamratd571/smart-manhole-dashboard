import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/smart-manhole-dashboard/",

  server: {
    host: "localhost",
    port: 5173
  },

  build: {
    outDir: "dist",
    sourcemap: false
  }
});