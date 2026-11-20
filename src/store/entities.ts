import type { AppState } from "../../types"

export const entities: Partial<AppState> = {
  // The Post form's addresses, which suggest places as you type.
  fromPlace: {
    type: "PlaceSearch",
    name: "fromPlace",
    labelKey: "postWalk.fromPlace",
    placeholderKey: "postWalk.fromPlaceHint",
  } as AppState["fromPlace"],
  toPlace: {
    type: "PlaceSearch",
    name: "toPlace",
    labelKey: "postWalk.toPlace",
    placeholderKey: "postWalk.toPlaceHint",
  } as AppState["toPlace"],
  // Back from a tab closes the app, as on other Android apps.
  backButton: {
    type: "BackButton",
    rootPaths: ["/", "/post", "/walks", "/profile"],
  },
}
