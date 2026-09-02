import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Frontend calls /api/*, Vite forwards to the backend in dev.
      // Set VITE_API_BASE instead if you deploy frontend/backend separately.
      "/api": "http://localhost:4000",
    },
  },
});
