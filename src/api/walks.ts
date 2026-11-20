import type {
  JoinedRow,
  JoinedWalk,
  NearbyQuery,
  NearbyRow,
  NearbyWalk,
  NewWalk,
  PostedRow,
  PostedWalk,
  RequestStatus,
} from "../../types/walks"
import { supabase } from "./supabase"

type Client = typeof supabase

const DEFAULT_RADIUS_M = 1000
const DEFAULT_WITHIN_MINUTES = 60
// Walks that left within the last hour still show among yours.
const RECENT_MS = 3_600_000

// Every function takes the client last, so tests can act as several students
// at once; the app uses the signed-in one.

export async function postWalk(walk: NewWalk, client: Client = supabase) {
  const { data, error } = await client.rpc("post_walk", {
    p_from_place: walk.fromPlace,
    p_to_place: walk.toPlace,
    p_departs_at: walk.departsAt,
    p_start_lat: walk.startLat,
    p_start_lng: walk.startLng,
    p_meeting_point: walk.meetingPoint,
    p_notes: walk.notes,
  })
  if (error) throw error
  return data as string
}

export async function nearbyWalks(
  {
    lat,
    lng,
    radiusM = DEFAULT_RADIUS_M,
    withinMinutes = DEFAULT_WITHIN_MINUTES,
  }: NearbyQuery,
  client: Client = supabase,
): Promise<NearbyWalk[]> {
  const { data, error } = await client.rpc("nearby_walks", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radiusM,
    p_within_minutes: withinMinutes,
  })
  if (error) throw error
  return (data as NearbyRow[]).map((row) => ({
    id: row.id,
    fromPlace: row.from_place,
    toPlace: row.to_place,
    departsAt: row.departs_at,
    notes: row.notes,
    posterName: row.poster_name,
    distanceM: row.distance_m,
    isMine: row.is_mine,
    requestStatus: row.request_status,
  }))
}

export async function postedWalks(
  client: Client = supabase,
): Promise<PostedWalk[]> {
  const { data, error } = await client
    .from("walks")
    .select(
      "id, from_place, to_place, departs_at, notes, meeting_points(details), walk_requests(id, status, profiles(name))",
    )
    .eq("user_id", await userId(client))
    .gte("departs_at", recentCutoff())
    .order("departs_at")
  if (error) throw error
  return (data as unknown as PostedRow[]).map((row) => ({
    id: row.id,
    fromPlace: row.from_place,
    toPlace: row.to_place,
    departsAt: row.departs_at,
    notes: row.notes,
    meetingPoint: row.meeting_points?.details ?? null,
    requests: row.walk_requests.map((request) => ({
      id: request.id,
      status: request.status,
      name: request.profiles.name,
    })),
  }))
}

export async function joinedWalks(
  client: Client = supabase,
): Promise<JoinedWalk[]> {
  const { data, error } = await client
    .from("walk_requests")
    .select(
      "id, status, walks!inner(id, from_place, to_place, departs_at, profiles(name), meeting_points(details))",
    )
    .eq("user_id", await userId(client))
    .gte("walks.departs_at", recentCutoff())
  if (error) throw error
  return (data as unknown as JoinedRow[])
    .map((row) => ({
      requestId: row.id,
      status: row.status,
      walkId: row.walks.id,
      fromPlace: row.walks.from_place,
      toPlace: row.walks.to_place,
      departsAt: row.walks.departs_at,
      posterName: row.walks.profiles.name,
      meetingPoint: row.walks.meeting_points?.details ?? null,
    }))
    .sort((a, b) => a.departsAt.localeCompare(b.departsAt))
}

export async function askToJoin(walkId: string, client: Client = supabase) {
  const { error } = await client
    .from("walk_requests")
    .insert({ walk_id: walkId })
  if (error) throw error
}

export async function answerRequest(
  requestId: string,
  status: Exclude<RequestStatus, "pending">,
  client: Client = supabase,
) {
  const { data, error } = await client
    .from("walk_requests")
    .update({ status })
    .eq("id", requestId)
    .select("id")
  if (error) throw error
  // Row-level security hides what you may not change: nothing changes and
  // nothing fails. Say so instead.
  if (!data.length) throw new Error("Request not found")
}

export async function withdrawRequest(
  requestId: string,
  client: Client = supabase,
) {
  const { error } = await client
    .from("walk_requests")
    .delete()
    .eq("id", requestId)
  if (error) throw error
}

export async function cancelWalk(walkId: string, client: Client = supabase) {
  const { error } = await client.from("walks").delete().eq("id", walkId)
  if (error) throw error
}

async function userId(client: Client) {
  const { data } = await client.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error("Not signed in")
  return id
}

function recentCutoff() {
  return new Date(Date.now() - RECENT_MS).toISOString()
}
