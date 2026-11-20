import { trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { MyWalksEntity } from "../../../types"
import { handlers } from "./handlers"

const myWalks: MyWalksEntity = {
  id: "myWalks",
  type: "MyWalks",
  posted: [
    {
      id: "walk1",
      fromPlace: "Kensington",
      toPlace: "SAIT",
      departsAt: "2026-12-01T07:40:00Z",
      notes: "",
      meetingPoint: "Plaza Theatre",
      requests: [{ id: "request1", status: "pending", name: "Marcus" }],
    },
  ],
  joined: [
    {
      requestId: "request2",
      status: "pending",
      walkId: "walk2",
      fromPlace: "Sunnyside",
      toPlace: "SAIT",
      departsAt: "2026-12-01T08:00:00Z",
      posterName: "Priya",
      meetingPoint: null,
    },
  ],
  status: "success",
  error: null,
  actionStatus: "idle",
  actionError: null,
  busyId: null,
  cancelingId: null,
}

describe("MyWalks handlers", () => {
  it("loads when its tab opens", () => {
    const { events } = trigger(myWalks, handlers.routeChange, {
      route: "myWalks",
      path: "/walks",
      params: {},
      query: {},
    })

    expect(events).toEqual([{ type: "#myWalks:walksLoad" }])
  })

  it("shows an answer as soon as it's saved", () => {
    const answer = { requestId: "request1", status: "accepted" as const }
    const entity = succeed(
      handlers.answer,
      handlers.answerStart!,
      handlers.answerSuccess,
      answer,
      answer,
    )

    expect(entity.posted[0].requests[0].status).toBe("accepted")
    expect(entity.busyId).toBeNull()
  })

  it("drops a withdrawn request from the list", () => {
    const entity = succeed(
      handlers.withdraw,
      handlers.withdrawStart!,
      handlers.withdrawSuccess,
      "request2",
      "request2",
    )

    expect(entity.joined).toEqual([])
  })

  it("asks before cancelling a walk", () => {
    const { entity } = trigger(myWalks, handlers.cancelAsk, "walk1")
    expect(entity.cancelingId).toBe("walk1")

    const dismissed = trigger(entity, handlers.cancelDismiss)
    expect(dismissed.entity.cancelingId).toBeNull()
  })
})

// A request's own steps, as the store runs them: ask, start, succeed.
function succeed<TPayload, TResult>(
  ask: Parameters<typeof trigger<MyWalksEntity, TPayload>>[1],
  start: Parameters<
    typeof trigger<MyWalksEntity, { payload: TPayload; callId: number }>
  >[1],
  success: Parameters<
    typeof trigger<MyWalksEntity, { result: TResult; callId: number }>
  >[1],
  payload: TPayload,
  result: TResult,
) {
  const asked = trigger(myWalks, ask, payload)
  const { callId } = asked.events[0].payload as { callId: number }
  const started = trigger(asked.entity, start, { payload, callId })
  return trigger(started.entity, success, { result, callId }).entity
}
