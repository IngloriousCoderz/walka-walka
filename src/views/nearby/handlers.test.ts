import { createMockApi, trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { NearbyEntity } from "../../../types"
import type { NearbyWalk } from "../../../types/walks"
import { handlers } from "./handlers"

const POSITION = {
  coords: {
    latitude: 51.0618,
    longitude: -114.0892,
    accuracy: 15,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: 0,
}

const WALK: NearbyWalk = {
  id: "walk1",
  fromPlace: "Kensington",
  toPlace: "SAIT",
  departsAt: "2026-12-01T07:40:00Z",
  notes: "",
  posterName: "Marcus",
  distanceM: 250,
  isMine: false,
  requestStatus: null,
}

const nearby: NearbyEntity = {
  id: "nearby",
  type: "Nearby",
  walks: [WALK],
  status: "idle",
  error: null,
  joinStatus: "idle",
  joinError: null,
  joiningId: null,
}

describe("Nearby handlers", () => {
  it("loads the walks around a new position while on screen", () => {
    const api = createMockApi({ nearby, router: onRoute("nearby") })
    const { events } = trigger(nearby, handlers.positionChange, POSITION, api)

    expect(events).toEqual([
      { type: "#nearby:walksLoad", payload: { lat: 51.0618, lng: -114.0892 } },
    ])
  })

  it("ignores positions asked for by another tab", () => {
    const api = createMockApi({ nearby, router: onRoute("postWalk") })
    const { events } = trigger(nearby, handlers.positionChange, POSITION, api)

    expect(events).toEqual([])
  })

  it("marks the walk as asked at once, without reloading", () => {
    // The request's own steps, as the store runs them: ask, start, succeed.
    const asked = trigger(nearby, handlers.join, "walk1")
    const { callId } = asked.events[0].payload as { callId: number }
    const started = trigger(asked.entity, handlers.joinStart!, {
      payload: "walk1",
      callId,
    })
    expect(started.entity.joiningId).toBe("walk1")

    const { entity, events } = trigger(started.entity, handlers.joinSuccess, {
      result: "walk1",
      callId,
    })

    expect(entity.joiningId).toBeNull()
    expect(entity.walks[0].requestStatus).toBe("pending")
    expect(events).toEqual([
      {
        type: "#toast:show",
        payload: { message: "Request sent", color: "success" },
      },
    ])
  })
})

function onRoute(route: string) {
  return { id: "router", type: "Router", route }
}
