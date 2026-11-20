import { Button } from "@inglorious/ui/button"
import { Flex } from "@inglorious/ui/flex"
import { Snackbar } from "@inglorious/ui/snackbar"
import { html } from "@inglorious/web"

import type { AppApi } from "../../types"

interface PromptProps {
  message: string
  askLabel: string
  declineLabel: string
  onAsk: () => void
  onDecline: () => void
}

export const Prompt = {
  render({ message, askLabel, declineLabel, onAsk, onDecline }: PromptProps) {
    return Snackbar.render({
      isOpen: true,
      position: "bottom-center",
      message,
      action: Flex.render({
        direction: "row",
        align: "center",
        gap: "sm",
        children: [
          Button.render({
            children: askLabel,
            color: "primary",
            size: "sm",
            onClick: onAsk,
          }),
          Button.render({
            children: declineLabel,
            variant: "ghost",
            size: "sm",
            onClick: onDecline,
          }),
        ],
      }),
    })
  },
}

export function renderPrompts(api: AppApi) {
  return html`${api.render("analytics")} ${api.render("pushPrompt")}`
}
