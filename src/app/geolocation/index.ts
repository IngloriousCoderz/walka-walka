import { Geolocation as GeolocationPlugin } from "@capacitor/geolocation"
import type { GeolocationPosition } from "@inglorious/web/device/geolocation"
import { createGeolocation } from "@inglorious/web/device/geolocation"

import type { AppApi, AppGeolocationEntity } from "../../../types"

const base = createGeolocation({ plugin: GeolocationPlugin })

// The framework's type, plus a broadcast whenever a new position arrives, so
// any screen can answer it: Nearby reloads, for one.
export const Geolocation = {
  ...base,

  geolocationSuccess(
    entity: AppGeolocationEntity,
    position: GeolocationPosition,
    api: AppApi,
  ) {
    base.geolocationSuccess(entity, position)
    api.notify("positionChange", entity.position)
  },
}
