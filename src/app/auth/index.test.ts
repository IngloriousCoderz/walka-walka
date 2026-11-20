import { trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { AppAuthEntity } from "../../../types"
import { Auth } from "."

const auth = {
  id: "auth",
  type: "Auth",
  step: "email",
  status: "idle",
  error: null,
  email: "",
} as AppAuthEntity

describe("Auth", () => {
  it("warns about an address outside SAIT, and lets the database decide", () => {
    const { entity, events } = trigger(auth, Auth.emailSubmit, "a@gmail.com")

    expect(entity.isOutsideSait).toBe(true)
    expect(events).toEqual([
      { type: "#auth:emailCheck", payload: "a@gmail.com" },
    ])
  })

  it("has no warning for a SAIT address", () => {
    const { entity, events } = trigger(
      { ...auth, isOutsideSait: true },
      Auth.emailSubmit,
      "aiko.tanaka@edu.sait.ca",
    )

    expect(entity.isOutsideSait).toBe(false)
    expect(events).toEqual([
      { type: "#auth:emailCheck", payload: "aiko.tanaka@edu.sait.ca" },
    ])
  })
})
