import { defineType } from "@inglorious/store"

import type { AppApi, NearbyEntity } from "../../../types"
import { handlers } from "./handlers"
import { template } from "./template"

export const Nearby = defineType<NearbyEntity, AppApi>()({
  ...handlers,
  ...template,

  render(entity: NearbyEntity, api: AppApi) {
    const geolocation = api.getEntity("geolocation")!
    const isLocating = geolocation.isLoading && !geolocation.position
    return this.renderNearby({
      walks: entity.walks,
      now: Date.now(),
      locale: api.getEntity("i18n")!.locale ?? "en",
      isLoading: isLocating || entity.status === "loading",
      problem:
        geolocation.error && !geolocation.position
          ? "noLocation"
          : entity.error,
      joiningId: entity.joiningId,
      onRefresh: () => api.notify(`#${entity.id}:refresh`),
      onJoin: (walkId: string) => api.notify(`#${entity.id}:join`, walkId),
    })
  },
})
