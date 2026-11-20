// The walks as the app sees them: camelCase, with only what each screen shows.

export type RequestStatus = "pending" | "accepted" | "declined"

export interface NewWalk {
  fromPlace: string
  toPlace: string
  departsAt: string
  startLat: number
  startLng: number
  meetingPoint: string
  notes: string
}

export interface NearbyQuery {
  lat: number
  lng: number
  radiusM?: number
  withinMinutes?: number
}

export interface NearbyWalk {
  id: string
  fromPlace: string
  toPlace: string
  departsAt: string
  notes: string
  posterName: string
  distanceM: number
  isMine: boolean
  requestStatus: RequestStatus | null
}

export interface WalkRequest {
  id: string
  status: RequestStatus
  name: string
}

// A walk you posted, with who asked to join.
export interface PostedWalk {
  id: string
  fromPlace: string
  toPlace: string
  departsAt: string
  notes: string
  meetingPoint: string | null
  requests: WalkRequest[]
}

// A walk you asked to join. The meeting point arrives once you're accepted.
export interface JoinedWalk {
  requestId: string
  status: RequestStatus
  walkId: string
  fromPlace: string
  toPlace: string
  departsAt: string
  posterName: string
  meetingPoint: string | null
}

// The rows Supabase answers with, snake_case as in the database.

export interface NearbyRow {
  id: string
  from_place: string
  to_place: string
  departs_at: string
  notes: string
  poster_name: string
  distance_m: number
  is_mine: boolean
  request_status: RequestStatus | null
}

export interface PostedRow {
  id: string
  from_place: string
  to_place: string
  departs_at: string
  notes: string
  meeting_points: { details: string } | null
  walk_requests: {
    id: string
    status: RequestStatus
    profiles: { name: string }
  }[]
}

export interface JoinedRow {
  id: string
  status: RequestStatus
  walks: {
    id: string
    from_place: string
    to_place: string
    departs_at: string
    profiles: { name: string }
    meeting_points: { details: string } | null
  }
}

// The Post form's fields, as typed: the departure in the input's local time.
export interface WalkValues {
  fromPlace: string
  toPlace: string
  departsAt: string
  meetingPoint: string
  notes: string
}

// Why a walk can't be posted yet, as a translation key.
export type WalkProblem = "noLocation" | "missingPlace" | "past" | "tooFar"
