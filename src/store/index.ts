import { App as NativeApp } from "@capacitor/app"
import { SystemBars } from "@capacitor/core"
import { Geolocation } from "@capacitor/geolocation"
import { LiveUpdate } from "@capawesome/capacitor-live-update"
import { createStore } from "@inglorious/store"
import { liveUpdateManifestUrl } from "@inglorious/supabase"
import { Toast } from "@inglorious/ui/toast"
import { withTransitions } from "@inglorious/ui/view-transitions"
import { createGeolocation } from "@inglorious/web/device/geolocation"
import { Keyboard } from "@inglorious/web/device/keyboard"
import { createAppLinks } from "@inglorious/web/native/app-links"
import { createBackButton } from "@inglorious/web/native/back-button"
import { createLiveUpdate } from "@inglorious/web/native/live-update"
import { createSystemBars } from "@inglorious/web/native/system-bars"
import { createPwaUpdate } from "@inglorious/web/pwa"
import { Router, setRoutes } from "@inglorious/web/router"

import type { AppEntity, AppEvents, AppState } from "../../types"
import { Analytics } from "../app/analytics"
import { Auth } from "../app/auth"
import { NativeUpdate } from "../app/native-update"
import { PushPrompt } from "../app/push-prompt"
import { I18n } from "../i18n"
import { MyWalks } from "../views/my-walks"
import { Nearby } from "../views/nearby"
import { PostWalk } from "../views/post-walk"
import { entities } from "./entities"
import { middlewares } from "./middlewares"
import { routes } from "./routes"

setRoutes(routes)

// Only release builds are stamped: a development build must not update itself.
const LiveUpdateType = createLiveUpdate({
  plugin: LiveUpdate,
  app: NativeApp,
  manifestUrl: liveUpdateManifestUrl(import.meta.env.VITE_SUPABASE_URL),
  release: Number(import.meta.env.VITE_LIVE_UPDATE_RELEASE),
})

export const store = createStore<AppEntity, AppState, AppEvents>({
  types: {
    Nearby,
    PostWalk,
    MyWalks,
    Router,
    I18n,
    Analytics,
    PushPrompt,
    NativeUpdate,
    Auth,
    Geolocation: createGeolocation({ plugin: Geolocation }),
    Toast,
    Keyboard,
    SystemBars: createSystemBars({ plugin: SystemBars }),
    AppLinks: createAppLinks({ plugin: NativeApp }),
    BackButton: createBackButton({ plugin: NativeApp }),
    PwaUpdate: createPwaUpdate(),
    LiveUpdate: LiveUpdateType,
  },
  entities,
  middlewares: [withTransitions(), ...middlewares],
  // Creates an entity for each type that has none: nearby, postWalk, myWalks, router, i18n, analytics, pushPrompt, nativeUpdate, liveUpdate, auth, geolocation, toast, keyboard, systemBars, appLinks, pwaUpdate.
  autoCreateEntities: true,
  // Freezes the state in development, so a write outside a handler throws.
  devMode: import.meta.env.DEV,
})
