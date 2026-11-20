import circleInfo from "@iconify-icons/fa7-solid/circle-info"
import house from "@iconify-icons/fa7-solid/house"
import user from "@iconify-icons/fa7-solid/user"
import { AppBar } from "@inglorious/ui/app-bar"
import { BottomNavigation } from "@inglorious/ui/bottom-navigation"
import { Container } from "@inglorious/ui/container"
import { Drawer } from "@inglorious/ui/drawer"
import { Icon } from "@inglorious/ui/icon"
import { List } from "@inglorious/ui/list"
import { Select } from "@inglorious/ui/select"
import { html } from "@inglorious/web"

import type { AppApi } from "../../types"
import { t } from "../i18n"

export const App = {
  render(props: Record<string, unknown> | null, api: AppApi) {
    const router = api.getEntity("router")!
    const i18n = api.getEntity("i18n")!

    // The same pages twice: a tab bar on phones, a drawer on wider screens.
    const tabs = [
      { path: "/", label: t("nav.home"), icon: house },
      { path: "/about", label: t("nav.about"), icon: circleInfo },
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
          trailing: html`<nav class="app-nav">
            ${[
              Select.render({
                value: i18n.locale,
                options: i18n.languages,
                size: "sm",
                ariaLabel: t("language"),
                onChange: (locale) => api.notify("#i18n:localeChange", locale),
              }),
            ]}
          </nav>`,
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
