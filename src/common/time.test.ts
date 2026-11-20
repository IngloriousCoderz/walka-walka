import { describe, expect, it } from "vitest"

import { formatDeparture, minutesUntil } from "./time"

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
