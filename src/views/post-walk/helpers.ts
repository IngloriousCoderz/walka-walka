import type { GeolocationPosition } from "@inglorious/web/device/geolocation"

import type { NewWalk, WalkProblem, WalkValues } from "../../../types/walks"

// The database accepts walks up to a week ahead.
const MAX_AHEAD_MS = 604_800_000
const MIN_PLACE_LENGTH = 2

export function emptyWalkValues(): WalkValues {
  return {
    fromPlace: "",
    toPlace: "",
    departsAt: "",
    meetingPoint: "",
    notes: "",
  }
}

// The same rules as the database, checked first so the screen can say what's
// wrong in words.
export function walkProblem(
  values: WalkValues,
  position: GeolocationPosition | null,
  now: number,
): WalkProblem | null {
  if (!position) return "noLocation"
  const places = [values.fromPlace, values.toPlace, values.meetingPoint]
  if (places.some((place) => place.trim().length < MIN_PLACE_LENGTH)) {
    return "missingPlace"
  }
  const departs = new Date(values.departsAt).getTime()
  if (Number.isNaN(departs) || departs <= now) return "past"
  if (departs > now + MAX_AHEAD_MS) return "tooFar"
  return null
}

export function toNewWalk(
  values: WalkValues,
  position: GeolocationPosition,
): NewWalk {
  return {
    fromPlace: values.fromPlace.trim(),
    toPlace: values.toPlace.trim(),
    // A datetime-local value has no time zone: the phone's is the right one.
    departsAt: new Date(values.departsAt).toISOString(),
    startLat: position.coords.latitude,
    startLng: position.coords.longitude,
    meetingPoint: values.meetingPoint.trim(),
    notes: values.notes.trim(),
  }
}
