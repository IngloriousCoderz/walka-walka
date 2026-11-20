import type { RoutesConfig } from "@inglorious/web/router"

// Each path names the entity its page renders.
export const routes: RoutesConfig = {
  "/": "nearby",
  "/post": "postWalk",
  "/walks": "myWalks",
  // The signed-in account, which the Auth entity renders.
  "/profile": "auth",
}
