import { trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { PlaceSearchEntity } from "../../../types"
import { handlers } from "./handlers"

const KENSINGTON = { label: "Kensington, Calgary", lat: 51.0525, lng: -114.087 }
const SUNNYSIDE = { label: "Sunnyside, Calgary", lat: 51.06, lng: -114.081 }

const field: PlaceSearchEntity = {
  id: "fromPlace",
  type: "PlaceSearch",
  name: "fromPlace",
  labelKey: "postWalk.fromPlace",
  placeholderKey: "postWalk.fromPlaceHint",
  query: "",
  places: [],
  chosen: null,
  isOpen: false,
  activeIndex: -1,
  status: "idle",
  error: null,
}

const open = { ...field, places: [KENSINGTON, SUNNYSIDE], isOpen: true }

describe("PlaceSearch handlers", () => {
  it("waits for three letters before searching", () => {
    const { entity, events } = trigger(open, handlers.queryChange, "ke")

    expect(entity.isOpen).toBe(false)
    expect(entity.places).toEqual([])
    expect(events).toEqual([])
  })

  it("searches what was typed, and forgets a place picked before", () => {
    const { entity, events } = trigger(
      { ...field, chosen: KENSINGTON },
      handlers.queryChange,
      "kens ",
    )

    expect(entity.chosen).toBeNull()
    expect(events).toEqual([{ type: "#fromPlace:search", payload: "kens" }])
  })

  it("moves through the suggestions, wrapping at the ends", () => {
    const down = trigger(open, handlers.activeMove, 1).entity
    expect(down.activeIndex).toBe(0)

    const up = trigger(down, handlers.activeMove, -1).entity
    expect(up.activeIndex).toBe(1)
  })

  it("keeps the place picked, with its label as the text", () => {
    const { entity } = trigger(open, handlers.choose, 1)

    expect(entity.chosen).toEqual(SUNNYSIDE)
    expect(entity.query).toBe("Sunnyside, Calgary")
    expect(entity.isOpen).toBe(false)
  })
})
