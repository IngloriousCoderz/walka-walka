import type { TemplateResult } from "@inglorious/web"

import type { NearbyWalk } from "./walks"

export interface NearbyProps {
  walks: NearbyWalk[]
  now: number
  locale: string
  isLoading: boolean
  // Why the list can't show: a translation key.
  problem: string | null
  joiningId: string | null
  onRefresh: () => void
  onJoin: (walkId: string) => void
}

export type NearbyTemplate = {
  renderNearby: (props: NearbyProps) => TemplateResult
  renderWalk: (walk: NearbyWalk, props: NearbyProps) => TemplateResult
  renderAction: (walk: NearbyWalk, props: NearbyProps) => TemplateResult
}
