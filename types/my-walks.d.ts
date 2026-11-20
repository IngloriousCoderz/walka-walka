import type { TemplateResult } from "@inglorious/web"

import type { JoinedWalk, PostedWalk, WalkRequest } from "./walks"

export interface MyWalksProps {
  posted: PostedWalk[]
  joined: JoinedWalk[]
  now: number
  locale: string
  isLoading: boolean
  error: string | null
  // The request or walk an action is running on, so its buttons wait.
  busyId: string | null
  // The walk whose cancellation awaits confirmation.
  cancelingId: string | null
  onAnswer: (requestId: string, status: "accepted" | "declined") => void
  onWithdraw: (requestId: string) => void
  onCancelAsk: (walkId: string) => void
  onCancelDismiss: () => void
  onCancel: () => void
}

export type MyWalksTemplate = {
  renderMyWalks: (props: MyWalksProps) => TemplateResult
  renderPosted: (walk: PostedWalk, props: MyWalksProps) => TemplateResult
  renderRequest: (request: WalkRequest, props: MyWalksProps) => TemplateResult
  renderJoined: (walk: JoinedWalk, props: MyWalksProps) => TemplateResult
}
