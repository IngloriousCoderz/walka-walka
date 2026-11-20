import { describe, expect, it, vi } from "vitest"

import type { PhotonFeature } from "../../types/places"
import { SAIT, searchPlaces, toPlace } from "./places"

const BUS_STOP: PhotonFeature = {
  geometry: { coordinates: [-114.0858, 51.053] },
  properties: {
    name: "NB 10 ST @ Kensington RD NW",
    street: "10 Street NW",
    district: "Hillhurst",
    city: "Calgary",
  },
}

const ADDRESS: PhotonFeature = {
  geometry: { coordinates: [-114.0897, 51.0645] },
  properties: { housenumber: "1301", street: "16 Avenue NW", city: "Calgary" },
}

describe("toPlace", () => {
  it("names a place, then its city", () => {
    expect(toPlace(BUS_STOP)).toEqual({
      label: "NB 10 ST @ Kensington RD NW, Calgary",
      lat: 51.053,
      lng: -114.0858,
    })
  })

  it("falls back to the address", () => {
    expect(toPlace(ADDRESS).label).toBe("1301 16 Avenue NW, Calgary")
  })
})

describe("searchPlaces", () => {
  it("asks Photon for a few places near a point, in the app's language", async () => {
    const fetchJson = vi.fn<typeof fetch>(async () =>
      Response.json({ features: [BUS_STOP, BUS_STOP, ADDRESS] }),
    )

    const places = await searchPlaces(
      { text: "kensington", near: SAIT, language: "fr" },
      fetchJson,
    )

    const url = new URL(String(fetchJson.mock.calls[0][0]))
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "kensington",
      lat: "51.0645",
      lon: "-114.0897",
      limit: "5",
      lang: "fr",
    })
    // The same label twice is one choice.
    expect(places.map(({ label }) => label)).toEqual([
      "NB 10 ST @ Kensington RD NW, Calgary",
      "1301 16 Avenue NW, Calgary",
    ])
  })

  it("leaves out a language Photon doesn't know", async () => {
    const fetchJson = vi.fn<typeof fetch>(async () =>
      Response.json({ features: [] }),
    )

    await searchPlaces({ text: "sait", near: SAIT, language: "ja" }, fetchJson)

    const url = new URL(String(fetchJson.mock.calls[0][0]))
    expect(url.searchParams.has("lang")).toBe(false)
  })

  it("fails loudly when Photon does", async () => {
    const fetchJson = vi.fn<typeof fetch>(
      async () => new Response("", { status: 503 }),
    )

    await expect(
      searchPlaces({ text: "sait", near: SAIT, language: "en" }, fetchJson),
    ).rejects.toThrow("Photon answered 503")
  })
})
