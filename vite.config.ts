import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { hmr } from "@inglorious/vite-plugin-hmr"
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals"
import { defineConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import { VitePWA } from "vite-plugin-pwa"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { version } = JSON.parse(
  readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
)

export default defineConfig({
  define: {
    "process.env": {},
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(version),
  },

  plugins: [
    VitePWA({
      injectRegister: false,
      registerType: "prompt",
      pwaAssets: {
        image: "public/logo.png",
        preset: "minimal-2023",
      },
      manifest: {
        name: "Walka Walka",
        short_name: "Walka Walka",
        description: "An Inglorious Web app.",
        theme_color: "#a6192e",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
      },
      workbox: {
        importScripts: ["sw-push.js"],
      },
    }),
    ViteImageOptimizer(),
    hmr(),
  ],

  build: {
    rollupOptions: {
      plugins: [minifyTemplateLiterals()],
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
