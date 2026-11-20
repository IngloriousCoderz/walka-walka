import "./vite-env"

import type { I18nEntity, I18nType } from "@inglorious/i18n"
import type {
  BaseEntity,
  EntitiesState,
  EntityType,
  EventsOf,
} from "@inglorious/store"
import type { AsyncEvents, RequestStatus } from "@inglorious/store/async"
import type { ToastEntity, ToastType } from "@inglorious/ui/toast"
import type { Api, TemplateResult } from "@inglorious/web"
import type { AnalyticsEntity, AnalyticsType } from "@inglorious/web/analytics"
import type { AuthEntity, AuthType } from "@inglorious/web/auth"
import type {
  GeolocationEntity,
  GeolocationType,
} from "@inglorious/web/device/geolocation"
import type {
  KeyboardEntity,
  KeyboardType,
} from "@inglorious/web/device/keyboard"
import type {
  AppLinksEntity,
  AppLinksType,
} from "@inglorious/web/native/app-links"
import type {
  BackButtonEntity,
  BackButtonType,
} from "@inglorious/web/native/back-button"
import type {
  LiveUpdateEntity,
  LiveUpdateType,
} from "@inglorious/web/native/live-update"
import type {
  SystemBarsEntity,
  SystemBarsType,
} from "@inglorious/web/native/system-bars"
import type {
  NativeUpdateEntity,
  NativeUpdateType,
} from "@inglorious/web/native/update"
import type { PushPromptEntity, PushPromptType } from "@inglorious/web/push"
import type { PwaUpdateEntity, PwaUpdateType } from "@inglorious/web/pwa"
import type {
  RouteChangePayload,
  RouterEntity,
  RouterType,
} from "@inglorious/web/router"

import type { NewWalk, WalkProblem, WalkValues } from "./walks"

// The tabs: walks starting near you, the form to post one, and your own.
export interface NearbyEntity extends BaseEntity {
  type: "Nearby"
}

export interface PostWalkEntity extends BaseEntity {
  type: "PostWalk"
  values: WalkValues
  problem: WalkProblem | null
  status: "idle" | RequestStatus
  error: string | null
}

export interface MyWalksEntity extends BaseEntity {
  type: "MyWalks"
}

export interface AppRouterEntity extends RouterEntity {
  type: "Router"
}

export interface AppI18nEntity extends I18nEntity {
  type: "I18n"
}

export interface AppAnalyticsEntity extends AnalyticsEntity {
  type: "Analytics"
}

export interface AppPushPromptEntity extends PushPromptEntity {
  type: "PushPrompt"
}

export interface AppNativeUpdateEntity extends NativeUpdateEntity {
  type: "NativeUpdate"
}

export interface AppAuthEntity extends AuthEntity {
  type: "Auth"
  // An email outside SAIT was typed: it needs an invitation.
  isOutsideSait?: boolean
}

// Where the phone is: shared by the screens that need it.
export interface AppGeolocationEntity extends GeolocationEntity {
  type: "Geolocation"
}

export interface AppToastEntity extends ToastEntity {
  type: "Toast"
}

export interface AppKeyboardEntity extends KeyboardEntity {
  type: "Keyboard"
}

export interface AppSystemBarsEntity extends SystemBarsEntity {
  type: "SystemBars"
}

export interface AppAppLinksEntity extends AppLinksEntity {
  type: "AppLinks"
}

export interface AppBackButtonEntity extends BackButtonEntity {
  type: "BackButton"
}

export interface AppPwaUpdateEntity extends PwaUpdateEntity {
  type: "PwaUpdate"
}

export interface AppLiveUpdateEntity extends LiveUpdateEntity {
  type: "LiveUpdate"
}

// Union type of all entities
export type AppEntity =
  | NearbyEntity
  | PostWalkEntity
  | MyWalksEntity
  | AppRouterEntity
  | AppI18nEntity
  | AppAnalyticsEntity
  | AppPushPromptEntity
  | AppNativeUpdateEntity
  | AppAuthEntity
  | AppGeolocationEntity
  | AppToastEntity
  | AppKeyboardEntity
  | AppSystemBarsEntity
  | AppAppLinksEntity
  | AppBackButtonEntity
  | AppPwaUpdateEntity
  | AppLiveUpdateEntity

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
  i18n: AppI18nEntity
  router: AppRouterEntity
  nearby: NearbyEntity
  postWalk: PostWalkEntity
  myWalks: MyWalksEntity
  analytics: AppAnalyticsEntity
  pushPrompt: AppPushPromptEntity
  nativeUpdate: AppNativeUpdateEntity
  auth: AppAuthEntity
  geolocation: AppGeolocationEntity
  toast: AppToastEntity
  keyboard: AppKeyboardEntity
  systemBars: AppSystemBarsEntity
  appLinks: AppAppLinksEntity
  backButton: AppBackButtonEntity
  pwaUpdate: AppPwaUpdateEntity
  liveUpdate: AppLiveUpdateEntity
}

// The events the app's types answer, so that `notify` checks them.
export type AppEvents = EventsOf<
  | NearbyType
  | PostWalkType
  | MyWalksType
  | RouterType
  | I18nType
  | AnalyticsType
  | PushPromptType
  | NativeUpdateType
  | AuthType
  | GeolocationType
  | ToastType
  | KeyboardType
  | SystemBarsType
  | AppLinksType
  | BackButtonType
  | PwaUpdateType
  | LiveUpdateType
>

export type AppApi = Api<AppEntity, AppState, AppEvents>

// Each type's events and their payloads. Declare types with `type`, not
// `interface`: an interface does not fit the store's `types`.
export type NearbyType = {
  render: (entity: NearbyEntity, api: AppApi) => TemplateResult
}

// The events of PostWalk, for `notify`; its renderers come from PostWalkTemplate.
export type PostWalkType = {
  create: (entity: PostWalkEntity) => void
  routeChange: (
    entity: PostWalkEntity,
    payload: RouteChangePayload,
    api: AppApi,
  ) => void
  locate: (entity: PostWalkEntity, payload: void, api: AppApi) => void
  submit: (entity: PostWalkEntity, values: WalkValues, api: AppApi) => void
  render: (entity: PostWalkEntity, api: AppApi) => TemplateResult
} & AsyncEvents<"walkPost", PostWalkEntity, NewWalk, string, AppApi>

export type MyWalksType = {
  render: (entity: MyWalksEntity, api: AppApi) => TemplateResult
}

// A shorthand for a type: `{ ... } satisfies AppType<NearbyEntity>` infers
// its handlers' parameters, but neither lists its events nor types payloads.
export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
