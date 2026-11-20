import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { ConfirmDialog } from "@inglorious/ui/confirm-dialog"
import { LoadStatus } from "@inglorious/ui/load-status"
import { html, nothing } from "@inglorious/web"
import { repeat } from "@inglorious/web/directives/repeat"

import type { MyWalksTemplate } from "../../../types/my-walks"
import { formatDeparture } from "../../common/time"
import { t } from "../../i18n"
import styles from "./style.module.css"

export const template: MyWalksTemplate & ThisType<MyWalksTemplate> = {
  renderMyWalks(props) {
    const { posted, joined } = props
    return html`
      <h1>${t("myWalks.title")}</h1>
      ${LoadStatus.render({
        isLoading: props.isLoading && !posted.length && !joined.length,
        loadingLabel: t("myWalks.loading"),
        isError: Boolean(props.error),
        error: props.error ? t(`myWalks.errors.${props.error}`) : "",
        isEmpty: !posted.length && !joined.length,
        emptyText: t("myWalks.empty"),
        content: () => html`
          ${
            posted.length
              ? html`<section class=${styles.section}>
                  <h2>${t("myWalks.posted")}</h2>
                  <ul class=${styles.list}>
                    ${repeat(
                      posted,
                      (walk) => walk.id,
                      (walk) =>
                        html`<li>${this.renderPosted(walk, props)}</li>`,
                    )}
                  </ul>
                </section>`
              : nothing
          }
          ${
            joined.length
              ? html`<section class=${styles.section}>
                  <h2>${t("myWalks.joined")}</h2>
                  <ul class=${styles.list}>
                    ${repeat(
                      joined,
                      (walk) => walk.requestId,
                      (walk) =>
                        html`<li>${this.renderJoined(walk, props)}</li>`,
                    )}
                  </ul>
                </section>`
              : nothing
          }
        `,
      })}
      ${ConfirmDialog.render({
        isOpen: Boolean(props.cancelingId),
        message: t("myWalks.cancelConfirm"),
        confirmLabel: t("myWalks.cancelYes"),
        cancelLabel: t("myWalks.cancelNo"),
        tone: "danger",
        isBusy: props.busyId === props.cancelingId,
        onConfirm: props.onCancel,
        onCancel: props.onCancelDismiss,
      })}
    `
  },

  renderPosted(walk, props) {
    return Card.render({
      element: "article",
      children: html`
        <h3 class=${styles.route}>
          ${t("walk.route", { from: walk.fromPlace, to: walk.toPlace })}
        </h3>
        <p class=${styles.meta}>
          ${formatDeparture(walk.departsAt, props.now, props.locale)}
        </p>
        ${
          walk.meetingPoint
            ? html`<p class=${styles.meeting}>
                ${t("myWalks.meetAt", { place: walk.meetingPoint })}
              </p>`
            : nothing
        }
        ${
          walk.requests.length
            ? html`<ul class=${styles.requests}>
                ${repeat(
                  walk.requests,
                  (request) => request.id,
                  (request) =>
                    html`<li>${this.renderRequest(request, props)}</li>`,
                )}
              </ul>`
            : html`<p class=${styles.meta}>${t("myWalks.noRequests")}</p>`
        }
      `,
      footer: Button.render({
        variant: "outline",
        color: "error",
        isFullWidth: true,
        isDisabled: props.busyId === walk.id,
        onClick: () => props.onCancelAsk(walk.id),
        children: t("myWalks.cancel"),
      }),
    })
  },

  renderRequest(request, props) {
    const isBusy = props.busyId === request.id
    return html`<div class=${styles.request}>
      <span>
        ${t(`myWalks.request.${request.status}`, { name: request.name })}
      </span>
      ${
        request.status === "pending"
          ? html`<span class=${styles.answers}>
              ${Button.render({
                color: "primary",
                isDisabled: isBusy,
                onClick: () => props.onAnswer(request.id, "accepted"),
                children: t("myWalks.accept"),
              })}
              ${Button.render({
                variant: "outline",
                isDisabled: isBusy,
                onClick: () => props.onAnswer(request.id, "declined"),
                children: t("myWalks.decline"),
              })}
            </span>`
          : nothing
      }
    </div>`
  },

  renderJoined(walk, props) {
    return Card.render({
      element: "article",
      children: html`
        <h3 class=${styles.route}>
          ${t("walk.route", { from: walk.fromPlace, to: walk.toPlace })}
        </h3>
        <p class=${styles.meta}>
          ${formatDeparture(walk.departsAt, props.now, props.locale)} ·
          ${t("nearby.postedBy", { name: walk.posterName })}
        </p>
        <p class=${styles.meta}>${t(`walk.status.${walk.status}`)}</p>
        ${
          walk.meetingPoint
            ? html`<p class=${styles.meeting}>
                ${t("myWalks.meetAt", { place: walk.meetingPoint })}
              </p>`
            : nothing
        }
      `,
      footer:
        walk.status === "declined"
          ? undefined
          : Button.render({
              variant: "outline",
              isFullWidth: true,
              isDisabled: props.busyId === walk.requestId,
              onClick: () => props.onWithdraw(walk.requestId),
              children: t("myWalks.withdraw"),
            }),
    })
  },
}
