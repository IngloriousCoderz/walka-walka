import { html } from "@inglorious/web"

import { t } from "../../i18n"

export const About = {
  render() {
    return html`
      <h1>${t("about.title")}</h1>
      <p>${t("about.body")}</p>
    `
  },
}
