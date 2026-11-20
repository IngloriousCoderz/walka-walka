import { defineType } from "@inglorious/store"

import type { AppApi, PostWalkEntity } from "../../../types"
import type { WalkValues } from "../../../types/walks"
import { handlers } from "./handlers"
import { template } from "./template"

export const PostWalk = defineType<PostWalkEntity, AppApi>()({
  ...handlers,
  ...template,

  render(entity: PostWalkEntity, api: AppApi) {
    const geolocation = api.getEntity("geolocation")!
    return this.renderPostWalk({
      values: entity.values,
      problem: entity.problem,
      error: entity.error,
      isBusy: entity.status === "loading",
      location: {
        isLoading: geolocation.isLoading,
        isFound: Boolean(geolocation.position),
        accuracyM: geolocation.position
          ? Math.round(geolocation.position.coords.accuracy)
          : null,
        isFailed: Boolean(geolocation.error),
      },
      onSubmit: (values: WalkValues) =>
        api.notify(`#${entity.id}:submit`, values),
      onLocate: () => api.notify(`#${entity.id}:locate`),
    })
  },
})
