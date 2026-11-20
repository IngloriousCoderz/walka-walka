import { handleRequest } from "@inglorious/store/async"
import { isNetworkError } from "@inglorious/supabase"
import type { RouteChangePayload } from "@inglorious/web/router"

import type { AppApi, MyWalksEntity } from "../../../types"
import type { MyWalksData, RequestAnswer } from "../../../types/walks"
import {
  answerRequest,
  cancelWalk,
  joinedWalks,
  postedWalks,
  withdrawRequest,
} from "../../api/walks"
import { t } from "../../i18n"

// The three actions share one status: only one runs at a time.
const ACTION = { status: "actionStatus", error: "actionError", toError }

export const handlers = {
  create(entity: MyWalksEntity) {
    entity.posted = []
    entity.joined = []
    entity.status = "idle"
    entity.error = null
    entity.actionStatus = "idle"
    entity.actionError = null
    entity.busyId = null
    entity.cancelingId = null
  },

  routeChange(
    entity: MyWalksEntity,
    { route }: RouteChangePayload,
    api: AppApi,
  ) {
    if (route === entity.id) api.notify(`#${entity.id}:walksLoad`)
  },

  ...handleRequest<MyWalksEntity, void, MyWalksData, AppApi, "walksLoad">(
    "walksLoad",
    {
      async run() {
        const [posted, joined] = await Promise.all([
          postedWalks(),
          joinedWalks(),
        ])
        return { posted, joined }
      },
      success(entity, { posted, joined }) {
        entity.posted = posted
        entity.joined = joined
      },
    },
    { toError },
  ),

  // Each action changes the screen as soon as the database agrees, without
  // waiting for a reload.
  ...handleRequest<
    MyWalksEntity,
    RequestAnswer,
    RequestAnswer,
    AppApi,
    "answer"
  >(
    "answer",
    {
      start(entity, { requestId }) {
        entity.busyId = requestId
      },
      async run(answer) {
        await answerRequest(answer.requestId, answer.status)
        return answer
      },
      success(entity, { requestId, status }, api) {
        entity.busyId = null
        const request = entity.posted
          .flatMap((walk) => walk.requests)
          .find(({ id }) => id === requestId)
        if (request) request.status = status
        api.notify("#analytics:analyticsTrack", {
          name: "walk_request_answer",
          params: { status },
        })
      },
      error: failed,
    },
    ACTION,
  ),

  ...handleRequest<MyWalksEntity, string, string, AppApi, "withdraw">(
    "withdraw",
    {
      start(entity, requestId) {
        entity.busyId = requestId
      },
      async run(requestId) {
        await withdrawRequest(requestId)
        return requestId
      },
      success(entity, requestId) {
        entity.busyId = null
        entity.joined = entity.joined.filter(
          (walk) => walk.requestId !== requestId,
        )
      },
      error: failed,
    },
    ACTION,
  ),

  // Cancelling a walk can't be undone: it asks first.
  cancelAsk(entity: MyWalksEntity, walkId: string) {
    entity.cancelingId = walkId
  },

  cancelDismiss(entity: MyWalksEntity) {
    entity.cancelingId = null
  },

  ...handleRequest<MyWalksEntity, string, string, AppApi, "cancel">(
    "cancel",
    {
      start(entity, walkId) {
        entity.busyId = walkId
      },
      async run(walkId) {
        await cancelWalk(walkId)
        return walkId
      },
      success(entity, walkId, api) {
        entity.busyId = null
        entity.cancelingId = null
        entity.posted = entity.posted.filter((walk) => walk.id !== walkId)
        api.notify("#toast:show", { message: t("myWalks.canceled") })
      },
      error: failed,
    },
    ACTION,
  ),
}

function failed(entity: MyWalksEntity, error: string, api: AppApi) {
  entity.busyId = null
  api.notify("#toast:show", {
    message: t(`myWalks.errors.${error}`),
    color: "error",
  })
}

function toError(error: unknown) {
  return isNetworkError(error) ? "network" : "unknown"
}
