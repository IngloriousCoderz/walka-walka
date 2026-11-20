import { html } from "@inglorious/web"

import type { PostWalkType } from "../../../types"
import { t } from "../../i18n"

export const PostWalk: PostWalkType = {
  render() {
    return html`
      <h1>${t("postWalk.title")}</h1>
      <p>${t("postWalk.empty")}</p>
    `
  },
}
