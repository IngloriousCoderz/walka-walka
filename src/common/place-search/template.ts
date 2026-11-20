import { Input } from "@inglorious/ui/input"
import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { repeat } from "@inglorious/web/directives/repeat"

import type {
  PlaceSearchProps,
  PlaceSearchTemplate,
} from "../../../types/places"
import { t } from "../../i18n"
import styles from "./style.module.css"

const DOWN = 1
const UP = -1
const NONE = -1

// An input that suggests places as you type: the ARIA combobox pattern, so
// screen readers announce the list and the arrow keys move through it.
export const template: PlaceSearchTemplate & ThisType<PlaceSearchTemplate> = {
  renderPlaceSearch(props) {
    const listId = `${props.id}-places`
    return html`<div class=${styles.field}>
      ${Input.render({
        id: props.id,
        name: props.name,
        label: props.label,
        placeholder: props.placeholder,
        value: props.query,
        isRequired: true,
        isFullWidth: true,
        size: "lg",
        autocomplete: "off",
        role: "combobox",
        "aria-autocomplete": "list",
        "aria-expanded": String(props.isOpen),
        "aria-controls": listId,
        "aria-activedescendant":
          props.activeIndex === NONE ? "" : `${listId}-${props.activeIndex}`,
        onChange: props.onQueryChange,
        onBlur: props.onClose,
        onkeydown: (event: KeyboardEvent) => onKey(event, props),
      })}
      ${props.isOpen ? this.renderSuggestions(props) : nothing}
    </div>`
  },

  renderSuggestions(props) {
    const listId = `${props.id}-places`
    return html`<ul id=${listId} role="listbox" class=${styles.list}>
      ${repeat(
        props.places,
        (place) => place.label,
        (place, index) =>
          html`<li
            id=${`${listId}-${index}`}
            role="option"
            aria-selected=${String(index === props.activeIndex)}
            class=${classMap({
              [styles.option]: true,
              [styles.active]: index === props.activeIndex,
            })}
            @mousedown=${(event: MouseEvent) => {
              // Before the input's blur, which would close the list first.
              event.preventDefault()
              props.onChoose(index)
            }}
          >
            ${place.label}
          </li>`,
      )}
      <li role="presentation" class=${styles.credit}>
        ${t("placeSearch.credit")}
      </li>
    </ul>`
  },
}

function onKey(event: KeyboardEvent, props: PlaceSearchProps) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault()
    props.onActiveMove(event.key === "ArrowDown" ? DOWN : UP)
  } else if (
    event.key === "Enter" &&
    props.isOpen &&
    props.activeIndex !== NONE
  ) {
    // Picks the place instead of sending the form.
    event.preventDefault()
    props.onChoose(props.activeIndex)
  } else if (event.key === "Escape" && props.isOpen) {
    event.preventDefault()
    props.onClose()
  }
}
