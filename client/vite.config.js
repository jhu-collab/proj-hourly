import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import istanbul from "vite-plugin-istanbul";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/proj-hourly/",
  plugins: [
    react(),
    istanbul({
      cypress: true,
      requireEnv: false,
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      workbox: {
        sourcemap: true,
        cleanupOutdatedCaches: false,
      },
      manifest: {
        name: "Hourly",
        short_name: "Hourly",
        description: "Office hour management made simple!",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "masked-icon.svg",
            sizes: "512x512",
            type: "image/svg",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 3000,
    hmr: true,
  },
  preview: {
    port: 3000,
  },
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
