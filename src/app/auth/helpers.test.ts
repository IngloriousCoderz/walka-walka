import { describe, expect, it } from "vitest"

import { isSaitEmail } from "./helpers"

describe("isSaitEmail", () => {
  it("accepts student and staff addresses", () => {
    expect(isSaitEmail("aiko.tanaka@edu.sait.ca")).toBe(true)
    expect(isSaitEmail("teacher@sait.ca")).toBe(true)
  })

  it("ignores case and spaces", () => {
    expect(isSaitEmail("  Aiko.Tanaka@EDU.SAIT.CA ")).toBe(true)
  })

  it("refuses other domains, look-alikes included", () => {
    expect(isSaitEmail("someone@gmail.com")).toBe(false)
    expect(isSaitEmail("someone@notsait.ca")).toBe(false)
    expect(isSaitEmail("sait.ca@gmail.com")).toBe(false)
  })
})
