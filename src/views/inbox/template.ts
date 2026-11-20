import { Button } from "@inglorious/ui/button"
import { LoadStatus } from "@inglorious/ui/load-status"
import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { repeat } from "@inglorious/web/directives/repeat"

import type { InboxTemplate } from "../../../types/inbox"
import { timeAgo } from "../../common/time"
import { t } from "../../i18n"
import styles from "./style.module.css"

const NONE = 0

export const template: InboxTemplate & ThisType<InboxTemplate> = {
  renderInbox(props) {
    return html`
      <div class=${styles.heading}>
        <h1>${t("inbox.title")}</h1>
        ${
          props.unread > NONE
            ? Button.render({
                variant: "ghost",
                onClick: props.onReadAll,
                children: t("inbox.readAll"),
              })
            : ""
        }
      </div>
      ${LoadStatus.render({
        isLoading: props.isLoading && !props.items.length,
        loadingLabel: t("inbox.loading"),
        isError: Boolean(props.problem),
        error: props.problem ? t(`inbox.errors.${props.problem}`) : "",
        isEmpty: !props.items.length,
        emptyText: t("inbox.empty"),
        content: () =>
          html`<ul class=${styles.list}>
            ${repeat(
              props.items,
              (item) => item.id,
              (item) => html`<li>${this.renderItem(item, props)}</li>`,
            )}
          </ul>`,
      })}
    `
  },

  renderItem(item, props) {
    return html`<button
      type="button"
      class=${classMap({ [styles.item]: true, [styles.unread]: !item.isRead })}
      @click=${() => props.onOpen(item)}
    >
      <span class=${styles.title}>${item.title}</span>
      <span class=${styles.body}>${item.body}</span>
      <span class=${styles.time}>
        ${timeAgo(item.createdAt, props.now, props.locale)}
        ${item.isRead ? "" : html`· <strong>${t("inbox.new")}</strong>`}
      </span>
    </button>`
  },
}
