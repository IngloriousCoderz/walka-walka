import type { TemplateResult } from "@inglorious/web"

// A place someone can pick: what to show, and where it is.
export interface Place {
  label: string
  lat: number
  lng: number
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface PlaceQuery {
  text: string
  // Results near here come first.
  near: Coordinates
  language: string
}

// What Photon answers: GeoJSON features with OpenStreetMap's properties.
export interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    housenumber?: string
    street?: string
    locality?: string
    district?: string
    city?: string
  }
}

export interface PlaceSearchProps {
  id: string
  name: string
  label: string
  placeholder: string
  query: string
  places: Place[]
  activeIndex: number
  isOpen: boolean
  onQueryChange: (query: string) => void
  onChoose: (index: number) => void
  onActiveMove: (step: number) => void
  onClose: () => void
}

export type PlaceSearchTemplate = {
  renderPlaceSearch: (props: PlaceSearchProps) => TemplateResult
  renderSuggestions: (props: PlaceSearchProps) => TemplateResult
}
