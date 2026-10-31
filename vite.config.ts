import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-redux",
      "react-router-dom",
      "react-hook-form",
      "@reduxjs/toolkit",
      "axios",
      "lucide-react",
    ],
  },
  server: {
    host: "127.0.0.1",
    headers: {
      "Cache-Control": "no-store",
    },
    hmr: {
      host: "127.0.0.1",
      protocol: "ws",
    },
    watch: {
      usePolling: true,
      interval: 150,
    },
  },
  preview: {
    headers: {
      "Cache-Control": "no-store",
    },
  },
});
