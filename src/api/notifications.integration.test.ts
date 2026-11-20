import { createClient } from "@supabase/supabase-js"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { inbox, markRead } from "./notifications"
import { askToJoin, cancelWalk, postWalk } from "./walks"

// The students of supabase/seed.sql.
const PASSWORD = "walka-local"
const AIKO = "aiko.tanaka@edu.sait.ca"
const MARCUS = "marcus.brown@edu.sait.ca"

const PERMISSION_DENIED = "42501"
const IN_TEN_MINUTES_MS = 600_000

const aiko = client()
const marcus = client()

let walkId: string

describe("the inbox", () => {
  beforeAll(async () => {
    await Promise.all([signIn(aiko, AIKO), signIn(marcus, MARCUS)])
    walkId = await postWalk(
      {
        fromPlace: "Sunnyside",
        toPlace: "SAIT Library",
        departsAt: new Date(Date.now() + IN_TEN_MINUTES_MS).toISOString(),
        startLat: 51.0585,
        startLng: -114.078,
        meetingPoint: "Sunnyside station",
        notes: "",
      },
      aiko,
    )
    // The request's trigger writes Aiko a notification.
    await askToJoin(walkId, marcus)
  })

  afterAll(async () => {
    if (walkId) await cancelWalk(walkId, aiko)
  })

  it("has the poster's notification, unread, and only theirs", async () => {
    const [latest] = await inbox(aiko)
    expect(latest).toMatchObject({
      title: "Marcus wants to walk with you",
      body: "Sunnyside → SAIT Library",
      url: "/walks",
      isRead: false,
    })

    const theirs = await inbox(marcus)
    expect(theirs.map(({ id }) => id)).not.toContain(latest.id)
  })

  it("lets nobody else mark it read", async () => {
    const [latest] = await inbox(aiko)

    await markRead([latest.id], marcus)

    const [same] = await inbox(aiko)
    expect(same.isRead).toBe(false)
  })

  it("lets the poster mark it read", async () => {
    const [latest] = await inbox(aiko)

    await markRead([latest.id], aiko)

    const [same] = await inbox(aiko)
    expect(same).toMatchObject({ id: latest.id, isRead: true })
  })

  it("keeps what it says out of reach", async () => {
    const [latest] = await inbox(aiko)

    const { error } = await aiko
      .from("notifications")
      .update({ title: "Anything" })
      .eq("id", latest.id)

    expect(error).toMatchObject({ code: PERMISSION_DENIED })
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
