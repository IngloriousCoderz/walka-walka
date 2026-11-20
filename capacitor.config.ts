import { existsSync, readFileSync } from "node:fs"

import type { CapacitorConfig } from "@capacitor/cli"

const LIVE_UPDATE_PUBLIC_KEY = "live-update.pub.pem"
const READY_TIMEOUT_MS = 10_000

// One line, as the plugin reads it. Without it, any bundle would be accepted:
// run `pnpm live:keys` before the first store build.
const publicKey = existsSync(LIVE_UPDATE_PUBLIC_KEY)
  ? readFileSync(LIVE_UPDATE_PUBLIC_KEY, "utf8").replaceAll("\n", "")
  : undefined

const config: CapacitorConfig = {
  appId: "ca.sait.walkawalka",
  appName: "Walka Walka",
  webDir: "dist",
  plugins: {
    LiveUpdate: {
      publicKey,
      readyTimeout: READY_TIMEOUT_MS,
      autoBlockRolledBackBundles: true,
      autoDeleteBundles: true,
    },
  },
}

export default config
