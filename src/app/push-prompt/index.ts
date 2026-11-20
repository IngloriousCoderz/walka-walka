import { withStorage } from "@inglorious/store/storage"
import { when } from "@inglorious/web/directives/when"
import { createPushPrompt } from "@inglorious/web/push"

import type { AppApi, AppPushPromptEntity } from "../../../types"
import { push } from "../../api/push"
import { Prompt } from "../../common/prompt"
import { t } from "../../i18n"

// A decline outlives the visit: storage keeps a copy of the entity's answer.
export const PushPrompt = [
  {
    ...createPushPrompt({ adapter: push }),

    render(entity: AppPushPromptEntity, api: AppApi) {
      // One question at a time, the consent first.
      return when(entity.isOpen && !api.getEntity("analytics")!.isAsking, () =>
        Prompt.render({
          message: t("push.prompt"),
          askLabel: t("push.ask"),
          declineLabel: t("push.decline"),
          onAsk: () => api.notify(`#${entity.id}:pushAsk`),
          onDecline: () => api.notify(`#${entity.id}:pushDecline`),
        }),
      )
    },
  },
  withStorage(["isDeclined"], { key: "walka-walka-push" }),
]
