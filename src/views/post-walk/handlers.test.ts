import { createMockApi, trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { PostWalkEntity } from "../../../types"
import { handlers } from "./handlers"
import { emptyWalkValues } from "./helpers"

const IN_AN_HOUR_MS = 3_600_000

const form: PostWalkEntity = {
  id: "postWalk",
  type: "PostWalk",
  values: emptyWalkValues(),
  problem: null,
  status: "idle",
  error: null,
}

const values = {
  fromPlace: "Kensington",
  toPlace: "SAIT",
  departsAt: localTime(Date.now() + IN_AN_HOUR_MS),
  meetingPoint: "Corner of 10 St and 5 Ave NW",
  notes: "",
}

describe("PostWalk handlers", () => {
  it("asks where the phone is when the tab opens", () => {
    const { events } = trigger(form, handlers.routeChange, {
      route: "postWalk",
      path: "/post",
      params: {},
      query: {},
    })

    expect(events).toEqual([
      {
        type: "#geolocation:geolocationRequest",
        payload: { enableHighAccuracy: true },
      },
    ])
  })

  it("posts nothing without a location", () => {
    const api = createMockApi({ postWalk: form, geolocation: located(null) })
    const { entity, events } = trigger(form, handlers.submit, values, api)

    expect(entity.problem).toBe("noLocation")
    expect(entity.values).toEqual(values)
    expect(events).toEqual([])
  })

  it("starts the walk at the place picked for From, over the phone's", () => {
    const position = { coords: { latitude: 51.06, longitude: -114.09 } }
    const kensington = {
      label: "Kensington, Calgary",
      lat: 51.0525,
      lng: -114.087,
    }
    const api = createMockApi({
      postWalk: form,
      geolocation: located(position),
      fromPlace: { id: "fromPlace", type: "PlaceSearch", chosen: kensington },
    })
    const { events } = trigger(form, handlers.submit, values, api)

    expect(events).toEqual([
      {
        type: "#postWalk:walkPost",
        payload: expect.objectContaining({
          startLat: 51.0525,
          startLng: -114.087,
        }),
      },
    ])
  })

  it("posts the walk from where the phone is", () => {
    const position = { coords: { latitude: 51.06, longitude: -114.09 } }
    const api = createMockApi({
      postWalk: form,
      geolocation: located(position),
    })
    const { entity, events } = trigger(form, handlers.submit, values, api)

    expect(entity.problem).toBeNull()
    expect(events).toEqual([
      {
        type: "#postWalk:walkPost",
        payload: expect.objectContaining({
          fromPlace: "Kensington",
          startLat: 51.06,
          startLng: -114.09,
        }),
      },
    ])
  })
})

function located(position: unknown) {
  return { id: "geolocation", type: "Geolocation", position }
}

// What a datetime-local input holds: local time, to the minute.
function localTime(time: number) {
  const date = new Date(time)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(time - offsetMs).toISOString().slice(0, 16)
}
