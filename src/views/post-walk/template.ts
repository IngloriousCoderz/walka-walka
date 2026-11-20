import { Alert } from "@inglorious/ui/alert"
import { Button } from "@inglorious/ui/button"
import { Input } from "@inglorious/ui/input"
import { Textarea } from "@inglorious/ui/textarea"
import { html, nothing } from "@inglorious/web"

import type { PostWalkTemplate } from "../../../types/post-walk"
import type { WalkValues } from "../../../types/walks"
import { t } from "../../i18n"
import styles from "./style.module.css"

const FIELDS: (keyof WalkValues)[] = [
  "fromPlace",
  "toPlace",
  "departsAt",
  "meetingPoint",
  "notes",
]

export const template: PostWalkTemplate & ThisType<PostWalkTemplate> = {
  renderPostWalk(props) {
    const { values, problem, error, isBusy } = props
    const message = problem ?? error
    return html`
      <h1>${t("postWalk.title")}</h1>
      <form class=${styles.form} @submit=${onSubmit(props.onSubmit)}>
        ${props.fromField} ${props.toField}
        ${Input.render({
          name: "departsAt",
          inputType: "datetime-local",
          label: t("postWalk.departsAt"),
          value: values.departsAt,
          isRequired: true,
          isFullWidth: true,
          size: "lg",
        })}
        ${Input.render({
          name: "meetingPoint",
          label: t("postWalk.meetingPoint"),
          hint: t("postWalk.meetingPointHint"),
          value: values.meetingPoint,
          isRequired: true,
          isFullWidth: true,
          size: "lg",
        })}
        ${Textarea.render({
          name: "notes",
          label: t("postWalk.notes"),
          placeholder: t("postWalk.notesHint"),
          value: values.notes,
          rows: 2,
          isFullWidth: true,
        })}
        ${this.renderLocation(props)}
        ${
          message
            ? Alert.render({
                severity: "error",
                description: t(`postWalk.errors.${message}`),
              })
            : nothing
        }
        ${Button.render({
          buttonType: "submit",
          color: "primary",
          size: "lg",
          isFullWidth: true,
          isDisabled: isBusy,
          children: t(isBusy ? "postWalk.posting" : "postWalk.post"),
        })}
      </form>
    `
  },

  // Where the walk starts comes from the phone, never typed: about 100 m is
  // all the database keeps of it.
  renderLocation({ location, chosenStart, onLocate }) {
    if (chosenStart) {
      return html`<p class=${styles.location}>
        ${t("postWalk.startsAtPlace")}
      </p>`
    }
    if (location.isFound) {
      return html`<p class=${styles.location}>
        ${t("postWalk.locationFound", { accuracy: location.accuracyM ?? "?" })}
      </p>`
    }
    return html`<p class=${styles.location}>
      <span>
        ${t(
          location.isLoading
            ? "postWalk.locating"
            : location.isFailed
              ? "postWalk.locationFailed"
              : "postWalk.locationNeeded",
        )}
      </span>
      ${
        location.isLoading
          ? nothing
          : Button.render({
              variant: "outline",
              onClick: onLocate,
              children: t("postWalk.locate"),
            })
      }
    </p>`
  },
}

// Reads the fields when the form is sent, rather than on every keystroke.
function onSubmit(submit: (values: WalkValues) => void) {
  return (event: SubmitEvent) => {
    event.preventDefault()
    const data = new FormData(event.target as HTMLFormElement)
    const values = Object.fromEntries(
      FIELDS.map((field) => [field, String(data.get(field) ?? "")]),
    ) as unknown as WalkValues
    submit(values)
  }
}
