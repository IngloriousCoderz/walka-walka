import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/app-bar.css"
import "@inglorious/ui/container.css"
import "@inglorious/ui/bottom-navigation.css"
import "@inglorious/ui/drawer.css"
import "@inglorious/ui/list.css"
import "@inglorious/ui/flex.css"
import "@inglorious/ui/icon.css"
import "@inglorious/ui/select.css"
import "@inglorious/ui/snackbar.css"
import "@inglorious/ui/button.css"
import "@inglorious/ui/input.css"
import "@inglorious/ui/alert.css"
import "@inglorious/ui/dialog.css"
import "@inglorious/ui/confirm-dialog.css"
import "@inglorious/ui/toast.css"
import "@inglorious/ui/view-transitions.css"
import "./app/style.css"
import "./pwa"

import { Haptics } from "@capacitor/haptics"
import { html, mount } from "@inglorious/web"
import { haptics } from "@inglorious/web/device/haptics"

import type { AppApi } from "../types"
import { supabase } from "./api/supabase"
import { App } from "./app"
import { renderPrompts } from "./common/prompt"
import { ready } from "./i18n"
import { store } from "./store"

// Mounts once the starting language has loaded, so the first render is
// already translated.
ready.then(() => mount(store, renderApp, document.getElementById("root")!))

supabase.auth.onAuthStateChange((_event, session) => {
  store.notify(session ? "#pushPrompt:pushStart" : "#pushPrompt:pushStop")
})

haptics.use(Haptics)

function renderApp(api: AppApi) {
  // An outdated native build shows nothing but the update page.
  if (api.getEntity("nativeUpdate")!.isUpdateRequired) {
    return html`${api.render("nativeUpdate")}`
  }
  // Nothing until the saved session is read, then the sign-in screen until
  // someone signs in.
  const auth = api.getEntity("auth")!
  if (!auth.isReady) return html``
  const page = auth.user ? App.render(null, api) : api.render("auth")
  return html`${page} ${renderPrompts(api)} ${api.render("toast")}`
}
