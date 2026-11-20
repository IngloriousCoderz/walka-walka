import { defineType } from "@inglorious/store"

import type { AppApi, MyWalksEntity } from "../../../types"
import { handlers } from "./handlers"
import { template } from "./template"

export const MyWalks = defineType<MyWalksEntity, AppApi>()({
  ...handlers,
  ...template,

  render(entity: MyWalksEntity, api: AppApi) {
    const id = `#${entity.id}`
    return this.renderMyWalks({
      posted: entity.posted,
      joined: entity.joined,
      now: Date.now(),
      locale: api.getEntity("i18n")!.locale ?? "en",
      isLoading: entity.status === "loading",
      error: entity.error,
      busyId: entity.busyId,
      cancelingId: entity.cancelingId,
      onAnswer: (requestId, status) =>
        api.notify(`${id}:answer`, { requestId, status }),
      onWithdraw: (requestId) => api.notify(`${id}:withdraw`, requestId),
      onCancelAsk: (walkId) => api.notify(`${id}:cancelAsk`, walkId),
      onCancelDismiss: () => api.notify(`${id}:cancelDismiss`),
      onCancel: () => {
        if (entity.cancelingId) api.notify(`${id}:cancel`, entity.cancelingId)
      },
    })
  },
})
