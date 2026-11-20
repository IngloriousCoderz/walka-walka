import type { TemplateResult } from "@inglorious/web"

import type { WalkProblem, WalkValues } from "./walks"

export interface PostWalkProps {
  // The address fields, rendered by their own PlaceSearch entities.
  fromField: unknown
  toField: unknown
  // The place picked for "From", which then is where the walk starts.
  chosenStart: string | null
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
