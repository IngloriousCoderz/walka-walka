import { createClient } from "@supabase/supabase-js"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import type { NewWalk } from "../../types/walks"
import {
  answerRequest,
  askToJoin,
  cancelWalk,
  joinedWalks,
  nearbyWalks,
  postedWalks,
  postWalk,
  withdrawRequest,
} from "./walks"

// The students of supabase/seed.sql.
const PASSWORD = "walka-local"
const AIKO = "aiko.tanaka@edu.sait.ca"
const MARCUS = "marcus.brown@edu.sait.ca"
const PRIYA = "priya.sharma@edu.sait.ca"

const PERMISSION_DENIED = "42501"
const IN_TEN_MINUTES_MS = 600_000
const AN_HOUR_AGO_MS = -3_600_000
const FAR_AWAY_DEGREES = 1

// Near SAIT: Aiko's corner, and Marcus a block away.
const AIKO_START = { lat: 51.061234, lng: -114.088765 }
const MARCUS_HERE = { lat: 51.0618, lng: -114.0892 }

const anonymous = client()
const aiko = client()
const marcus = client()
const priya = client()

let walkId: string

describe("who may see and do what with a walk", () => {
  beforeAll(async () => {
    await Promise.all([
      signIn(aiko, AIKO),
      signIn(marcus, MARCUS),
      signIn(priya, PRIYA),
    ])
    walkId = await postWalk(walk(), aiko)
  })

  afterAll(async () => {
    if (walkId) await cancelWalk(walkId, aiko)
  })

  it("hides walks from anyone signed out", async () => {
    const { data } = await anonymous.from("walks").select("id")
    expect(data).toEqual([])

    await expect(nearbyWalks(MARCUS_HERE, anonymous)).rejects.toMatchObject({
      code: PERMISSION_DENIED,
    })
  })

  it("stores the start only to about 100 m", async () => {
    const { data } = await aiko
      .from("walks")
      .select("start_lat, start_lng")
      .eq("id", walkId)
      .single()

    expect(data).toEqual({ start_lat: 51.061, start_lng: -114.089 })
  })

  it("refuses a walk in the past", async () => {
    const past = new Date(Date.now() + AN_HOUR_AGO_MS).toISOString()

    await expect(
      postWalk(walk({ departsAt: past }), aiko),
    ).rejects.toMatchObject({ code: PERMISSION_DENIED })
  })

  it("shows the walk to students nearby, but not where to meet", async () => {
    const nearby = await nearbyWalks(MARCUS_HERE, marcus)
    const found = nearby.find((candidate) => candidate.id === walkId)

    expect(found).toMatchObject({
      posterName: "Aiko",
      isMine: false,
      requestStatus: null,
    })
    expect(found?.distanceM).toBeLessThan(200)
    expect(found).not.toHaveProperty("meetingPoint")

    const { data } = await marcus.from("meeting_points").select("details")
    expect(data).toEqual([])
  })

  it("leaves out walks starting far away", async () => {
    const farAway = { ...MARCUS_HERE, lat: MARCUS_HERE.lat + FAR_AWAY_DEGREES }
    const nearby = await nearbyWalks(farAway, marcus)

    expect(nearby.map((candidate) => candidate.id)).not.toContain(walkId)
  })

  it("lets nobody ask to join their own walk", async () => {
    await expect(askToJoin(walkId, aiko)).rejects.toMatchObject({
      code: PERMISSION_DENIED,
    })
  })

  it("lets a student ask to join only as pending", async () => {
    const { error } = await marcus
      .from("walk_requests")
      .insert({ walk_id: walkId, status: "accepted" })
    expect(error?.code).toBe(PERMISSION_DENIED)

    await askToJoin(walkId, marcus)
    const [joined] = await joinedWalks(marcus)

    expect(joined).toMatchObject({
      walkId,
      status: "pending",
      posterName: "Aiko",
      meetingPoint: null,
    })
  })

  it("keeps requests between the requester and the poster", async () => {
    const { data } = await priya
      .from("walk_requests")
      .select("id")
      .eq("walk_id", walkId)
    expect(data).toEqual([])

    const [posted] = await postedWalks(aiko)
    expect(posted.requests).toEqual([
      { id: expect.any(String), status: "pending", name: "Marcus" },
    ])
  })

  it("lets only the poster answer, and only the status change", async () => {
    const [{ requestId }] = await joinedWalks(marcus)

    await expect(answerRequest(requestId, "accepted", marcus)).rejects.toThrow(
      "Request not found",
    )
    await expect(answerRequest(requestId, "accepted", priya)).rejects.toThrow(
      "Request not found",
    )

    const { error } = await aiko
      .from("walk_requests")
      .update({ walk_id: crypto.randomUUID() })
      .eq("id", requestId)
    expect(error?.code).toBe(PERMISSION_DENIED)

    await answerRequest(requestId, "accepted", aiko)
  })

  it("shows where to meet to accepted buddies only", async () => {
    const [joined] = await joinedWalks(marcus)
    expect(joined).toMatchObject({
      status: "accepted",
      meetingPoint: "Corner of 10 St and 5 Ave NW",
    })

    const { data } = await priya.from("meeting_points").select("details")
    expect(data).toEqual([])
  })

  it("lets a requester withdraw", async () => {
    const [{ requestId }] = await joinedWalks(marcus)
    await withdrawRequest(requestId, marcus)

    expect(await joinedWalks(marcus)).toEqual([])
  })
})

function client() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

async function signIn(student: ReturnType<typeof client>, email: string) {
  const { error } = await student.auth.signInWithPassword({
    email,
    password: PASSWORD,
  })
  if (error) throw error
}

function walk(fields: Partial<NewWalk> = {}): NewWalk {
  return {
    fromPlace: "Kensington",
    toPlace: "SAIT Heritage Hall",
    departsAt: new Date(Date.now() + IN_TEN_MINUTES_MS).toISOString(),
    startLat: AIKO_START.lat,
    startLng: AIKO_START.lng,
    meetingPoint: "Corner of 10 St and 5 Ave NW",
    notes: "",
    ...fields,
  }
}
