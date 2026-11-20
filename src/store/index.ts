import { App as NativeApp } from "@capacitor/app"
import { SystemBars } from "@capacitor/core"
import { LiveUpdate } from "@capawesome/capacitor-live-update"
import { createStore } from "@inglorious/store"
import { liveUpdateManifestUrl, realtimeSource } from "@inglorious/supabase"
import { Toast } from "@inglorious/ui/toast"
import { withTransitions } from "@inglorious/ui/view-transitions"
import { withDebounce } from "@inglorious/web/decorators/with-debounce"
import { withLiveReload } from "@inglorious/web/decorators/with-live-reload"
import { Keyboard } from "@inglorious/web/device/keyboard"
import { createAppLinks } from "@inglorious/web/native/app-links"
import { createBackButton } from "@inglorious/web/native/back-button"
import { createLiveUpdate } from "@inglorious/web/native/live-update"
import { createSystemBars } from "@inglorious/web/native/system-bars"
import { createPwaUpdate } from "@inglorious/web/pwa"
import { Router, setRoutes } from "@inglorious/web/router"

import type {
  AppApi,
  AppEntity,
  AppEvents,
  AppState,
  InboxEntity,
  MyWalksEntity,
} from "../../types"
import { supabase } from "../api/supabase"
import { Analytics } from "../app/analytics"
import { Auth } from "../app/auth"
import { Geolocation } from "../app/geolocation"
import { NativeUpdate } from "../app/native-update"
import { PushPrompt } from "../app/push-prompt"
import { PlaceSearch } from "../common/place-search"
import { I18n } from "../i18n"
import { Inbox } from "../views/inbox"
import { MyWalks } from "../views/my-walks"
import { Nearby } from "../views/nearby"
import { PostWalk } from "../views/post-walk"
import { entities } from "./entities"
import { middlewares } from "./middlewares"
import { routes } from "./routes"

setRoutes(routes)

const SEARCH_DELAY_MS = 300

// Changes others make, as they happen: someone asks to join, or answers.
const live = realtimeSource(supabase)

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
    MyWalks: [
      MyWalks,
      withLiveReload<MyWalksEntity, AppApi>({
        source: live,
        tables: ["walks", "walk_requests"],
        event: "walksLoad",
        // Only while on screen.
        isLive: (entity, api) => api.getEntity("router")!.route === entity.id,
      }),
    ],
    Inbox: [
      Inbox,
      withLiveReload<InboxEntity, AppApi>({
        source: live,
        tables: ["notifications"],
        event: "inboxLoad",
        // Whenever someone is signed in: the bell counts on every page.
        isLive: (_entity, api) => Boolean(api.getEntity("auth")!.user),
      }),
    ],
    Router,
    I18n,
    Analytics,
    PushPrompt,
    NativeUpdate,
    Auth,
    Geolocation,
    // Photon is asked once typing pauses, not on every key.
    PlaceSearch: [PlaceSearch, withDebounce(SEARCH_DELAY_MS, ["search"])],
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
  // Creates an entity for each type that has none: nearby, postWalk, myWalks, inbox, router, i18n, analytics, pushPrompt, nativeUpdate, liveUpdate, auth, geolocation, toast, keyboard, systemBars, appLinks, pwaUpdate.
  autoCreateEntities: true,
  // Freezes the state in development, so a write outside a handler throws.
  devMode: import.meta.env.DEV,
})
