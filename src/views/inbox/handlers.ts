import { handleRequest } from "@inglorious/store/async"
import { isNetworkError } from "@inglorious/supabase"
import type { RouteChangePayload } from "@inglorious/web/router"

import type { AppApi, InboxEntity } from "../../../types"
import type { InboxItem } from "../../../types/inbox"
import { inbox, markRead } from "../../api/notifications"

export const handlers = {
  create(entity: InboxEntity) {
    entity.items = []
    entity.status = "idle"
    entity.error = null
    entity.readStatus = "idle"
    entity.readError = null
    entity.knownIds = null
  },

  routeChange(entity: InboxEntity, { route }: RouteChangePayload, api: AppApi) {
    if (route === entity.id) api.notify(`#${entity.id}:inboxLoad`)
  },

  ...handleRequest<InboxEntity, void, InboxItem[], AppApi, "inboxLoad">(
    "inboxLoad",
    {
      run: () => inbox(),
      success(entity, items, api) {
        const isOnScreen = api.getEntity("router")!.route === entity.id
        if (entity.knownIds && !isOnScreen) {
          for (const item of arrivals(items, entity.knownIds)) {
            api.notify("#toast:show", {
              title: item.title,
              message: item.body,
              color: "info",
            })
          }
        }
        entity.items = items
        entity.knownIds = items.map(({ id }) => id)
      },
    },
    { toError },
  ),

  // Signed out: nothing to show, and the next sign-in starts afresh.
  inboxClear(entity: InboxEntity) {
    entity.items = []
    entity.status = "idle"
    entity.error = null
    entity.knownIds = null
  },

  // Opening a notification reads it and goes where it points.
  open(entity: InboxEntity, item: InboxItem, api: AppApi) {
    if (!item.isRead) {
      markLocally(entity, [item.id])
      api.notify(`#${entity.id}:readSave`, [item.id])
    }
    api.notify("#router:navigate", item.url)
  },

  readAll(entity: InboxEntity, _payload: void, api: AppApi) {
    markLocally(entity)
    api.notify(`#${entity.id}:readSave`, undefined)
  },

  // The screen shows them read at once; a failure reloads what's true.
  ...handleRequest<InboxEntity, string[] | undefined, void, AppApi, "readSave">(
    "readSave",
    {
      run: (ids) => markRead(ids),
      error(entity, _error, api) {
        api.notify(`#${entity.id}:inboxLoad`)
      },
    },
    { status: "readStatus", error: "readError", toError },
  ),
}

export function unreadCount(items: InboxItem[]) {
  return items.filter(({ isRead }) => !isRead).length
}

// Unread notifications the last load didn't have. The first load only learns
// what's there: what waited before the app opened isn't news.
export function arrivals(items: InboxItem[], knownIds: string[]) {
  const known = new Set(knownIds)
  return items.filter(({ id, isRead }) => !isRead && !known.has(id))
}

function markLocally(entity: InboxEntity, ids?: string[]) {
  for (const item of entity.items) {
    if (!ids || ids.includes(item.id)) item.isRead = true
  }
}

function toError(error: unknown) {
  return isNetworkError(error) ? "network" : "unknown"
}
