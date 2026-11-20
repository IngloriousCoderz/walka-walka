import { html } from "@inglorious/web"

import type { MyWalksType } from "../../../types"
import { t } from "../../i18n"

export const MyWalks: MyWalksType = {
  render() {
    return html`
      <h1>${t("myWalks.title")}</h1>
      <p>${t("myWalks.empty")}</p>
    `
  },
}
