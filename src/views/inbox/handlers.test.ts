import { trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { InboxEntity } from "../../../types"
import type { InboxItem } from "../../../types/inbox"
import { arrivals, handlers, unreadCount } from "./handlers"

const ASKED: InboxItem = {
  id: "n1",
  title: "Marcus wants to walk with you",
  body: "Kensington → SAIT",
  url: "/walks",
  createdAt: "2026-12-01T07:00:00Z",
  isRead: false,
}

const ACCEPTED: InboxItem = {
  id: "n2",
  title: "Priya accepted: you're walking together",
  body: "Sunnyside → SAIT",
  url: "/walks",
  createdAt: "2026-11-30T07:00:00Z",
  isRead: true,
}

const inbox: InboxEntity = {
  id: "inbox",
  type: "Inbox",
  items: [ASKED, ACCEPTED],
  status: "success",
  error: null,
  readStatus: "idle",
  readError: null,
  knownIds: ["n1", "n2"],
}

describe("Inbox", () => {
  it("opens a notification: reads it, saves that, goes where it points", () => {
    const { entity, events } = trigger(inbox, handlers.open, ASKED)

    expect(entity.items[0].isRead).toBe(true)
    expect(events).toEqual([
      { type: "#inbox:readSave", payload: ["n1"] },
      { type: "#router:navigate", payload: "/walks" },
    ])
  })

  it("doesn't save again a notification already read", () => {
    const { events } = trigger(inbox, handlers.open, ACCEPTED)

    expect(events).toEqual([{ type: "#router:navigate", payload: "/walks" }])
  })

  it("reads them all at once", () => {
    const { entity, events } = trigger(inbox, handlers.readAll)

    expect(unreadCount(entity.items)).toBe(0)
    expect(events).toEqual([{ type: "#inbox:readSave", payload: undefined }])
  })

  it("forgets everything on sign-out", () => {
    const { entity } = trigger(inbox, handlers.inboxClear)

    expect(entity).toMatchObject({ items: [], knownIds: null })
  })
})

describe("arrivals", () => {
  it("are the unread ones the last load didn't have", () => {
    const fresh = { ...ASKED, id: "n3" }

    expect(arrivals([fresh, ASKED, ACCEPTED], ["n1", "n2"])).toEqual([fresh])
  })
})
