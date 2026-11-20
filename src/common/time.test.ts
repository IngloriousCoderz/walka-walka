import { describe, expect, it } from "vitest"

import { formatDeparture, minutesUntil, timeAgo } from "./time"

const NOW = new Date("2026-12-01T07:00").getTime()

// Intl may use a narrow no-break space before AM: compare words, not spaces.
function departure(iso: string, locale: string) {
  return formatDeparture(iso, NOW, locale).replace(/\s/g, " ")
}

describe("formatDeparture", () => {
  it("gives only the time today", () => {
    expect(departure("2026-12-01T07:40", "en")).toBe("7:40 AM")
    expect(departure("2026-12-01T07:40", "fr")).toBe("7:40")
  })

  it("adds the day on another day", () => {
    expect(departure("2026-12-02T07:40", "en")).toBe("Wed 7:40 AM")
  })
})

describe("minutesUntil", () => {
  it("counts whole minutes, negative once gone", () => {
    expect(minutesUntil("2026-12-01T07:12:20", NOW)).toBe(12)
    expect(minutesUntil("2026-12-01T06:58", NOW)).toBe(-2)
  })
})

describe("timeAgo", () => {
  it("says now, then minutes, hours and days", () => {
    expect(timeAgo("2026-12-01T07:00", NOW, "en")).toBe("now")
    expect(timeAgo("2026-12-01T06:55", NOW, "en")).toBe("5 minutes ago")
    expect(timeAgo("2026-12-01T04:00", NOW, "en")).toBe("3 hours ago")
    expect(timeAgo("2026-11-30T07:00", NOW, "en")).toBe("yesterday")
  })

  it("speaks the app's language", () => {
    expect(timeAgo("2026-12-01T06:55", NOW, "fr")).toBe("il y a 5 minutes")
  })
})
