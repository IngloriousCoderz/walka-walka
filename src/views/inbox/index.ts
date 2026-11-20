import { defineType } from "@inglorious/store"

import type { AppApi, InboxEntity } from "../../../types"
import { handlers, unreadCount } from "./handlers"
import { template } from "./template"

export const Inbox = defineType<InboxEntity, AppApi>()({
  ...handlers,
  ...template,

  render(entity: InboxEntity, api: AppApi) {
    const id = `#${entity.id}`
    return this.renderInbox({
      items: entity.items,
      unread: unreadCount(entity.items),
      now: Date.now(),
      locale: api.getEntity("i18n")!.locale ?? "en",
      isLoading: entity.status === "loading",
      problem: entity.error,
      onOpen: (item) => api.notify(`${id}:open`, item),
      onReadAll: () => api.notify(`${id}:readAll`),
    })
  },
})

export { unreadCount } from "./handlers"
