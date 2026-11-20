import { defineType } from "@inglorious/store"

import type { AppApi, PlaceSearchEntity } from "../../../types"
import { t } from "../../i18n"
import { handlers } from "./handlers"
import { template } from "./template"

// One entity per field: its label and placeholder are translation keys.
export const PlaceSearch = defineType<PlaceSearchEntity, AppApi>()({
  ...handlers,
  ...template,

  render(entity: PlaceSearchEntity, api: AppApi) {
    const id = `#${entity.id}`
    return this.renderPlaceSearch({
      id: entity.name,
      name: entity.name,
      label: t(entity.labelKey),
      placeholder: t(entity.placeholderKey),
      query: entity.query,
      places: entity.places,
      activeIndex: entity.activeIndex,
      isOpen: entity.isOpen,
      onQueryChange: (query) => api.notify(`${id}:queryChange`, query),
      onChoose: (index) => api.notify(`${id}:choose`, index),
      onActiveMove: (step) => api.notify(`${id}:activeMove`, step),
      onClose: () => api.notify(`${id}:close`),
    })
  },
})
