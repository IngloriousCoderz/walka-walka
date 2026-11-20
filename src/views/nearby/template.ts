import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { LoadStatus } from "@inglorious/ui/load-status"
import { html, nothing } from "@inglorious/web"
import { repeat } from "@inglorious/web/directives/repeat"

import type { NearbyTemplate } from "../../../types/nearby"
import { formatDeparture, minutesUntil } from "../../common/time"
import { t } from "../../i18n"
import styles from "./style.module.css"

const NO_MINUTES_LEFT = 0

export const template: NearbyTemplate & ThisType<NearbyTemplate> = {
  renderNearby(props) {
    return html`
      <div class=${styles.heading}>
        <h1>${t("nearby.title")}</h1>
        ${Button.render({
          variant: "ghost",
          isDisabled: props.isLoading,
          onClick: props.onRefresh,
          children: t("nearby.refresh"),
        })}
      </div>
      ${LoadStatus.render({
        isLoading: props.isLoading && !props.walks.length,
        loadingLabel: t("nearby.loading"),
        isError: Boolean(props.problem),
        error: props.problem ? t(`nearby.errors.${props.problem}`) : "",
        isEmpty: !props.walks.length,
        emptyText: t("nearby.empty"),
        content: () =>
          html`<ul class=${styles.list}>
            ${repeat(
              props.walks,
              (walk) => walk.id,
              (walk) => html`<li>${this.renderWalk(walk, props)}</li>`,
            )}
          </ul>`,
      })}
    `
  },

  renderWalk(walk, props) {
    const minutes = minutesUntil(walk.departsAt, props.now)
    return Card.render({
      element: "article",
      children: html`
        <h2 class=${styles.route}>
          ${t("walk.route", { from: walk.fromPlace, to: walk.toPlace })}
        </h2>
        <p class=${styles.meta}>
          ${formatDeparture(walk.departsAt, props.now, props.locale)} ·
          ${
            minutes > NO_MINUTES_LEFT
              ? t("walk.inMinutes", { count: minutes })
              : t("walk.leavingNow")
          }
          · ${t("nearby.distance", { distance: walk.distanceM })}
        </p>
        <p class=${styles.meta}>
          ${t("nearby.postedBy", { name: walk.posterName })}
        </p>
        ${
          walk.notes
            ? html`<p class=${styles.notes}>${walk.notes}</p>`
            : nothing
        }
      `,
      footer: this.renderAction(walk, props),
    })
  },

  renderAction(walk, props) {
    if (walk.isMine) return html`<span>${t("nearby.yours")}</span>`
    if (walk.requestStatus) {
      return html`<span>${t(`walk.status.${walk.requestStatus}`)}</span>`
    }
    return Button.render({
      color: "primary",
      size: "lg",
      isFullWidth: true,
      isDisabled: props.joiningId === walk.id,
      onClick: () => props.onJoin(walk.id),
      children: t("nearby.join"),
    })
  },
}
