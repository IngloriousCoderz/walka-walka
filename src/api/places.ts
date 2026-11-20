import type {
  Coordinates,
  PhotonFeature,
  Place,
  PlaceQuery,
} from "../../types/places"

// Photon (photon.komoot.io): address search over OpenStreetMap, made for
// search-as-you-type, free and with no key. Its fair-use rules ask for few
// requests, which the debounce and the minimum length keep.
const PHOTON_URL = "https://photon.komoot.io/api/"
const MAX_RESULTS = 5
// The languages Photon labels results in; others get the local names.
const PHOTON_LANGUAGES = new Set(["en", "fr", "de"])

// Searches start here until the phone says where it is.
export const SAIT: Coordinates = { lat: 51.0645, lng: -114.0897 }

export async function searchPlaces(
  { text, near, language }: PlaceQuery,
  fetchJson: typeof fetch = fetch,
): Promise<Place[]> {
  const url = new URL(PHOTON_URL)
  url.searchParams.set("q", text)
  url.searchParams.set("lat", String(near.lat))
  url.searchParams.set("lon", String(near.lng))
  url.searchParams.set("limit", String(MAX_RESULTS))
  if (PHOTON_LANGUAGES.has(language)) url.searchParams.set("lang", language)

  const response = await fetchJson(url)
  if (!response.ok) throw new Error(`Photon answered ${response.status}`)
  const { features } = (await response.json()) as { features: PhotonFeature[] }
  return uniqueByLabel(features.map(toPlace))
}

// "NB 10 ST @ Kensington RD NW, Calgary", or "1301 16 Avenue NW, Calgary":
// the name, or the address, then the city.
export function toPlace({ geometry, properties }: PhotonFeature): Place {
  const address = [properties.housenumber, properties.street]
    .filter(Boolean)
    .join(" ")
  const parts = [
    properties.name ?? address,
    properties.city ?? properties.district ?? properties.locality,
  ].filter((part): part is string => Boolean(part))
  const [lng, lat] = geometry.coordinates
  return { label: [...new Set(parts)].join(", "), lat, lng }
}

function uniqueByLabel(places: Place[]) {
  const seen = new Set<string>()
  return places.filter(({ label }) => {
    if (seen.has(label)) return false
    seen.add(label)
    return true
  })
}
