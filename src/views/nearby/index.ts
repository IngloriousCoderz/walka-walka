import { html } from "@inglorious/web"

import type { NearbyType } from "../../../types"
import { t } from "../../i18n"

export const Nearby: NearbyType = {
  render() {
    return html`
      <h1>${t("nearby.title")}</h1>
      <p>${t("nearby.empty")}</p>
    `
  },
}
