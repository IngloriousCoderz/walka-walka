import { App } from "@capacitor/app"
import { supabaseNativeUpdate } from "@inglorious/supabase"
import { Button } from "@inglorious/ui/button"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { createNativeUpdate } from "@inglorious/web/native/update"

import type { AppApi, AppNativeUpdateEntity } from "../../../types"
import { supabase } from "../../api/supabase"
import { t } from "../../i18n"

export const NativeUpdate = {
  ...createNativeUpdate({
    adapter: supabaseNativeUpdate(supabase),
    plugin: App,
  }),

  render(entity: AppNativeUpdateEntity, api: AppApi) {
    const body = entity.storeUrl
      ? t("nativeUpdate.body")
      : t("nativeUpdate.bodyNoLink")

    return html`<main class="app-update">
      <h1>${t("nativeUpdate.title")}</h1>
      <p>${body}</p>
      ${when(entity.storeUrl, () =>
        Button.render({
          children: t("nativeUpdate.update"),
          color: "primary",
          onClick: () => api.notify(`#${entity.id}:nativeUpdateApply`),
        }),
      )}
    </main>`
  },
}
