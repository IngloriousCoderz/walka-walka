import locationDot from "@iconify-icons/fa7-solid/location-dot"
import personWalking from "@iconify-icons/fa7-solid/person-walking"
import plus from "@iconify-icons/fa7-solid/plus"
import user from "@iconify-icons/fa7-solid/user"
import { AppBar } from "@inglorious/ui/app-bar"
import { BottomNavigation } from "@inglorious/ui/bottom-navigation"
import { Container } from "@inglorious/ui/container"
import { Drawer } from "@inglorious/ui/drawer"
import { Icon } from "@inglorious/ui/icon"
import { List } from "@inglorious/ui/list"
import { html } from "@inglorious/web"

import type { AppApi } from "../../types"
import { t } from "../i18n"

export const App = {
  render(props: Record<string, unknown> | null, api: AppApi) {
    const router = api.getEntity("router")!

    // The same pages twice: a tab bar on phones, a drawer on wider screens.
    const tabs = [
      { path: "/", label: t("nav.nearby"), icon: locationDot },
      { path: "/post", label: t("nav.post"), icon: plus },
      { path: "/walks", label: t("nav.walks"), icon: personWalking },
      { path: "/profile", label: t("auth.profile"), icon: user },
    ]
    const navigate = (path: string) =>
      api.notify("#router:navigate", { to: path, replace: true })

    return html`
      ${Drawer.render({
        variant: "permanent",
        title: "Walka Walka",
        className: "app-drawer pt-safe",
        children: List.render({
          isInset: true,
          padding: "sm",
          items: tabs.map((tab) => ({
            id: tab.path,
            primary: tab.label,
            icon: Icon.render({ icon: tab.icon, size: "lg" }),
            isSelected: tab.path === router.path,
            onClick: () => navigate(tab.path),
          })),
        }),
      })}
      <header class="pt-safe">
        ${AppBar.render({
          title: "Walka Walka",
          color: "primary",
        })}
      </header>
      <main>
        ${Container.render({ maxWidth: "md", children: api.render(router.route) })}
      </main>
      <footer class="pb-safe">
        ${BottomNavigation.render({
          value: router.path,
          actions: tabs.map((tab) => ({
            value: tab.path,
            label: tab.label,
            icon: Icon.render({ icon: tab.icon, size: "lg" }),
          })),
          onChange: navigate,
        })}
      </footer>
    `
  },
}
