import type { AppState } from "../../types"

export const entities: Partial<AppState> = {
  // Back from a tab closes the app, as on other Android apps.
  backButton: {
    type: "BackButton",
    rootPaths: ["/", "/post", "/walks", "/profile"],
  },
}
