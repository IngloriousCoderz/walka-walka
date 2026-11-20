import { handleRequest } from "@inglorious/store/async"
import { isNetworkError } from "@inglorious/supabase"
import type { RouteChangePayload } from "@inglorious/web/router"

import type { AppApi, PostWalkEntity } from "../../../types"
import type { NewWalk, WalkValues } from "../../../types/walks"
import { postWalk } from "../../api/walks"
import { t } from "../../i18n"
import { emptyWalkValues, toNewWalk, walkProblem } from "./helpers"

const LOCATION_OPTIONS = { enableHighAccuracy: true }

export const handlers = {
  create(entity: PostWalkEntity) {
    entity.values = emptyWalkValues()
    entity.problem = null
    entity.status = "idle"
    entity.error = null
  },

  // Opening the tab asks the phone where we are, so it's ready by the time
  // the form is filled in.
  routeChange(
    entity: PostWalkEntity,
    { route }: RouteChangePayload,
    api: AppApi,
  ) {
    if (route === entity.id) {
      api.notify("#geolocation:geolocationRequest", LOCATION_OPTIONS)
    }
  },

  locate(_entity: PostWalkEntity, _payload: void, api: AppApi) {
    api.notify("#geolocation:geolocationRequest", LOCATION_OPTIONS)
  },

  submit(entity: PostWalkEntity, values: WalkValues, api: AppApi) {
    entity.values = values
    const { position } = api.getEntity("geolocation")!
    entity.problem = walkProblem(values, position, Date.now())
    if (entity.problem || !position) return
    api.notify(`#${entity.id}:walkPost`, toNewWalk(values, position))
  },

  ...handleRequest<PostWalkEntity, NewWalk, string, AppApi, "walkPost">(
    "walkPost",
    {
      run: (walk) => postWalk(walk),
      success(entity, _walkId, api) {
        entity.values = emptyWalkValues()
        api.notify("#toast:show", {
          message: t("postWalk.posted"),
          color: "success",
        })
        api.notify("#analytics:analyticsTrack", { name: "walk_post" })
        api.notify("#router:navigate", { to: "/walks", replace: true })
      },
    },
    { toError: (error) => (isNetworkError(error) ? "network" : "unknown") },
  ),
}
