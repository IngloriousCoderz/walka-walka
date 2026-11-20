import { describe, expect, it } from "vitest"

import { emptyWalkValues, toNewWalk, walkProblem } from "./helpers"

const NOW = new Date("2026-12-01T07:00").getTime()
const START = { lat: 51.0612, lng: -114.0888 }
const VALUES = {
  ...emptyWalkValues(),
  fromPlace: " Kensington ",
  toPlace: "SAIT",
  departsAt: "2026-12-01T07:40",
  meetingPoint: "Corner of 10 St and 5 Ave NW",
}

describe("walkProblem", () => {
  it("accepts a complete walk later today", () => {
    expect(walkProblem(VALUES, START, NOW)).toBeNull()
  })

  it("needs a start: a picked place or the phone's location", () => {
    expect(walkProblem(VALUES, null, NOW)).toBe("noLocation")
  })

  it("needs both places and a meeting point", () => {
    expect(walkProblem({ ...VALUES, meetingPoint: " " }, START, NOW)).toBe(
      "missingPlace",
    )
  })

  it("refuses the past and more than a week ahead", () => {
    const past = { ...VALUES, departsAt: "2026-12-01T06:59" }
    const tooFar = { ...VALUES, departsAt: "2026-12-09T07:00" }

    expect(walkProblem(past, START, NOW)).toBe("past")
    expect(walkProblem(tooFar, START, NOW)).toBe("tooFar")
  })
})

describe("toNewWalk", () => {
  it("trims the text and keeps the start it is given", () => {
    expect(toNewWalk(VALUES, START)).toEqual({
      fromPlace: "Kensington",
      toPlace: "SAIT",
      departsAt: new Date("2026-12-01T07:40").toISOString(),
      startLat: 51.0612,
      startLng: -114.0888,
      meetingPoint: "Corner of 10 St and 5 Ave NW",
      notes: "",
    })
  })
})
