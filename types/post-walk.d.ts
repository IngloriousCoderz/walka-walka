import type { TemplateResult } from "@inglorious/web"

import type { WalkProblem, WalkValues } from "./walks"

export interface PostWalkProps {
  values: WalkValues
  problem: WalkProblem | null
  error: string | null
  isBusy: boolean
  location: {
    isLoading: boolean
    isFound: boolean
    accuracyM: number | null
    isFailed: boolean
  }
  onSubmit: (values: WalkValues) => void
  onLocate: () => void
}

export type PostWalkTemplate = {
  renderPostWalk: (props: PostWalkProps) => TemplateResult
  renderLocation: (props: PostWalkProps) => TemplateResult
}
