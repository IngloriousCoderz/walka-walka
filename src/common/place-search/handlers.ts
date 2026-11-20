import { handleRequest } from "@inglorious/store/async"

import type { AppApi, PlaceSearchEntity } from "../../../types"
import type { Place, PlaceQuery } from "../../../types/places"
import { SAIT, searchPlaces } from "../../api/places"

// Fewer letters would match half the city, and spend Photon's fair use.
const MIN_QUERY_LENGTH = 3
const NONE = -1

export const handlers = {
  create(entity: PlaceSearchEntity) {
    entity.query ??= ""
    entity.places = []
    entity.chosen = null
    entity.isOpen = false
    entity.activeIndex = NONE
    entity.status = "idle"
    entity.error = null
  },

  // Typing makes the place a choice again: a picked place is only kept while
  // the text is its label.
  queryChange(entity: PlaceSearchEntity, query: string, api: AppApi) {
    entity.query = query
    entity.chosen = null
    entity.activeIndex = NONE
    if (query.trim().length < MIN_QUERY_LENGTH) {
      entity.places = []
      entity.isOpen = false
      return
    }
    api.notify(`#${entity.id}:search`, query.trim())
  },

  ...handleRequest<PlaceSearchEntity, string, Place[], AppApi, "search">(
    "search",
    {
      run(text, api) {
        return searchPlaces(placeQuery(text, api))
      },
      success(entity, places) {
        // Typing may have gone on, or been deleted, since.
        if (entity.query.trim().length < MIN_QUERY_LENGTH) return
        entity.places = places
        entity.isOpen = Boolean(places.length)
        entity.activeIndex = NONE
      },
    },
    // A failed search only means no suggestions: the field still takes text.
    { toError: () => "unavailable" },
  ),

  choose(entity: PlaceSearchEntity, index: number) {
    const place = entity.places[index]
    if (!place) return
    entity.chosen = place
    entity.query = place.label
    entity.places = []
    entity.isOpen = false
    entity.activeIndex = NONE
  },

  // Arrow keys move through the suggestions, wrapping at either end.
  activeMove(entity: PlaceSearchEntity, step: number) {
    const count = entity.places.length
    if (!count) return
    entity.isOpen = true
    entity.activeIndex = (entity.activeIndex + step + count) % count
  },

  close(entity: PlaceSearchEntity) {
    entity.isOpen = false
    entity.activeIndex = NONE
  },

  reset(entity: PlaceSearchEntity) {
    entity.query = ""
    entity.places = []
    entity.chosen = null
    entity.isOpen = false
    entity.activeIndex = NONE
  },
}

// Near the phone when it knows where it is, near SAIT otherwise; in the
// app's language.
function placeQuery(text: string, api: AppApi): PlaceQuery {
  const position = api.getEntity("geolocation")?.position
  const near = position
    ? { lat: position.coords.latitude, lng: position.coords.longitude }
    : SAIT
  return { text, near, language: api.getEntity("i18n")?.locale ?? "en" }
}
