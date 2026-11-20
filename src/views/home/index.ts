import fontAwesome from "@iconify-icons/fa7-brands/font-awesome"
import { Icon } from "@inglorious/ui/icon"
import { html } from "@inglorious/web"

import type { HomeType } from "../../../types"
import { t } from "../../i18n"

export const Home: HomeType = {
  render(entity, api) {
    return html`
      <h1>${t("home.title")}</h1>
      <p>
        ${api.render("message1")}, ${api.render("message2")},
        ${api.render("message3")}!
      </p>
      <p>${t("home.hint")}</p>
      <p class="app-icons">
        ${Icon.render({
          icon: fontAwesome,
          size: "lg",
          label: "Font Awesome",
        })}
      </p>
    `
  },
}
