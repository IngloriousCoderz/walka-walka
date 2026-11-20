import type { RoutesConfig } from "@inglorious/web/router"

// Each path names the entity its page renders.
export const routes: RoutesConfig = {
  "/": "home",
  "/about": "about",
  // The signed-in account, which the Auth entity renders.
  "/profile": "auth",
}
