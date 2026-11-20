import { createI18n } from "@inglorious/i18n"

// One catalogue per language in ./locales, loaded when it is needed. Adding a
// language is adding its file.
export const { I18n, t, ready } = createI18n({
  catalogues: import.meta.glob("./locales/*.json"),
  defaultLocale: "en",
  storageKey: "walka-walka-locale",
})
