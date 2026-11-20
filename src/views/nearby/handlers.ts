import { handleRequest } from "@inglorious/store/async"
import { isNetworkError } from "@inglorious/supabase"
import type { GeolocationPosition } from "@inglorious/web/device/geolocation"
import type { RouteChangePayload } from "@inglorious/web/router"

import type { AppApi, NearbyEntity } from "../../../types"
import type { NearbyQuery, NearbyWalk } from "../../../types/walks"
import { askToJoin, nearbyWalks } from "../../api/walks"
import { t } from "../../i18n"

const LOCATION_OPTIONS = { enableHighAccuracy: true }

export const handlers = {
  create(entity: NearbyEntity) {
    entity.walks = []
    entity.status = "idle"
    entity.error = null
    entity.joinStatus = "idle"
    entity.joinError = null
    entity.joiningId = null
  },

  // Opening the tab, or asking to refresh, starts with where the phone is now;
  // the list loads once the position arrives.
  routeChange(
    entity: NearbyEntity,
    { route }: RouteChangePayload,
    api: AppApi,
  ) {
    if (route === entity.id) {
      api.notify("#geolocation:geolocationRequest", LOCATION_OPTIONS)
    }
  },

  refresh(_entity: NearbyEntity, _payload: void, api: AppApi) {
    api.notify("#geolocation:geolocationRequest", LOCATION_OPTIONS)
  },

  // Positions also arrive for the Post tab: load only while on screen.
  positionChange(
    entity: NearbyEntity,
    position: GeolocationPosition | null,
    api: AppApi,
  ) {
    if (!position || api.getEntity("router")!.route !== entity.id) return
    api.notify(`#${entity.id}:walksLoad`, {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
  },

  ...handleRequest<
    NearbyEntity,
    NearbyQuery,
    NearbyWalk[],
    AppApi,
    "walksLoad"
  >(
    "walksLoad",
    {
      run: (query) => nearbyWalks(query),
      success(entity, walks) {
        entity.walks = walks
      },
    },
    { toError },
  ),

  ...handleRequest<NearbyEntity, string, string, AppApi, "join">(
    "join",
    {
      start(entity, walkId) {
        entity.joiningId = walkId
      },
      async run(walkId) {
        await askToJoin(walkId)
        return walkId
      },
      // Your own change shows at once, without waiting for a reload.
      success(entity, walkId, api) {
        entity.joiningId = null
        const walk = entity.walks.find((candidate) => candidate.id === walkId)
        if (walk) walk.requestStatus = "pending"
        api.notify("#toast:show", {
          message: t("nearby.requested"),
          color: "success",
        })
      },
      error(entity, error, api) {
        entity.joiningId = null
        api.notify("#toast:show", {
          message: t(`nearby.errors.${error}`),
          color: "error",
        })
      },
    },
    { status: "joinStatus", error: "joinError", toError },
  ),
}

function toError(error: unknown) {
  return isNetworkError(error) ? "network" : "unknown"
}
