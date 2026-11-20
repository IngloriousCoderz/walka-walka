import { trigger } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import type { MessageEntity } from "../../../../types"
import { Message } from "."

const message: MessageEntity = { id: "message1", type: "Message", who: "world" }

describe("Message", () => {
  it("shouts on click", () => {
    const { entity } = trigger(message, Message.click)

    expect(entity.isUpperCase).toBe(true)
  })

  it("speaks normally on a second click", () => {
    const { entity } = trigger({ ...message, isUpperCase: true }, Message.click)

    expect(entity.isUpperCase).toBe(false)
  })
})
