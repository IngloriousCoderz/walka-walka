import { firebaseAnalytics } from "@inglorious/firebase/analytics"
import { withStorage } from "@inglorious/store/storage"
import { createAnalytics } from "@inglorious/web/analytics"
import { when } from "@inglorious/web/directives/when"

import type { AppAnalyticsEntity, AppApi } from "../../../types"
import { firebaseConfig } from "../../api/firebase"
import { Prompt } from "../../common/prompt"
import { t } from "../../i18n"

// The answer outlives the visit: storage keeps a copy of the entity's consent.
export const Analytics = [
  {
    ...createAnalytics({
      adapter: firebaseAnalytics({ firebase: firebaseConfig }),
    }),

    render(entity: AppAnalyticsEntity, api: AppApi) {
      return when(entity.isAsking, () =>
        Prompt.render({
          message: t("analytics.prompt"),
          askLabel: t("analytics.accept"),
          declineLabel: t("analytics.decline"),
          onAsk: () => api.notify(`#${entity.id}:analyticsConsent`, true),
          onDecline: () => api.notify(`#${entity.id}:analyticsConsent`, false),
        }),
      )
    },
  },
  withStorage(["consent"], { key: "walka-walka-analytics" }),
]
