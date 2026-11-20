import type { AppState } from "../../types"

export const entities: Partial<AppState> = {
  message1: { type: "Message", who: "world" },
  message2: { type: "Message", who: "wide" },
  message3: { type: "Message", who: "web" },
  // Back from a top-level page closes the app, as on other Android apps.
  backButton: { type: "BackButton", rootPaths: ["/", "/about", "/profile"] },
}
