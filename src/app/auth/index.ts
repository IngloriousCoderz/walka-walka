import { Alert } from "@inglorious/ui/alert"
import { Button } from "@inglorious/ui/button"
import { ConfirmDialog } from "@inglorious/ui/confirm-dialog"
import { Input } from "@inglorious/ui/input"
import { Select } from "@inglorious/ui/select"
import type { TemplateResult } from "@inglorious/web"
import { html, nothing } from "@inglorious/web"
import { createAuth } from "@inglorious/web/auth"

import type { AppApi, AppAuthEntity } from "../../../types"
import { authAdapter } from "../../api/auth"
import { t } from "../../i18n"
import { isSaitEmail } from "./helpers"

const auth = createAuth({ adapter: authAdapter, methods: ["password", "code"] })

export const Auth = {
  ...auth,

  // SAIT addresses, plus guests the database invited. Only the database knows
  // the guests, so it decides; the screen only warns, early, that another
  // address needs an invitation.
  emailSubmit(entity: AppAuthEntity, email: string, api: AppApi) {
    entity.isOutsideSait = !isSaitEmail(email)
    auth.emailSubmit(entity, email, api)
  },

  // Signed in, the profile page at /profile; signed out, the sign-in
  // screen, which src/main shows instead of the app.
  render(entity: AppAuthEntity, api: AppApi) {
    return entity.user ? account(entity, api) : screen(entity, api)
  },
}

const steps: Partial<
  Record<
    AppAuthEntity["step"],
    (entity: AppAuthEntity, api: AppApi) => TemplateResult
  >
> = {
  email: emailStep,
  password: passwordStep,
  signUp: signUpStep,
  reset: resetStep,
  code: codeStep,
}

function screen(entity: AppAuthEntity, api: AppApi) {
  return html`<section class="app-auth">
    ${steps[entity.step]?.(entity, api)} ${saitHint(entity)}
    ${errorMessage(entity)}
    <div id="captcha"></div>
  </section>`
}

function emailStep(entity: AppAuthEntity, api: AppApi) {
  return html`<form
    @submit=${onSubmit((data) =>
      api.notify(`#${entity.id}:emailSubmit`, field(data, "email")),
    )}
  >
    <h1>${t("auth.title")}</h1>
    ${Input.render({
      name: "email",
      inputType: "email",
      label: t("auth.email"),
      value: entity.email,
      autocomplete: "email",
      isRequired: true,
      isFullWidth: true,
    })}
    ${Button.render({
      buttonType: "submit",
      color: "primary",
      isFullWidth: true,
      isDisabled: entity.status === "loading",
      children: t("auth.continue"),
    })}
  </form>`
}

function passwordStep(entity: AppAuthEntity, api: AppApi) {
  return html`<form
    @submit=${onSubmit((data) =>
      api.notify(`#${entity.id}:signInSubmit`, field(data, "password")),
    )}
  >
    <h1>${t("auth.title")}</h1>
    <p>${entity.email}</p>
    ${Input.render({
      name: "password",
      inputType: "password",
      label: t("auth.password"),
      autocomplete: "current-password",
      isRequired: true,
      isFullWidth: true,
    })}
    ${Button.render({
      buttonType: "submit",
      color: "primary",
      isFullWidth: true,
      isDisabled: entity.status === "loading",
      children: t("auth.signIn"),
    })}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:resetRequest`),
      children: t("auth.forgot"),
    })}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:signUpShow`),
      children: t("auth.signUpOffer"),
    })}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:codeRequest`),
      children: t("auth.codeOffer"),
    })}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:back`),
      children: t("auth.change"),
    })}
  </form>`
}

function signUpStep(entity: AppAuthEntity, api: AppApi) {
  return html`<form
    @submit=${onSubmit((data) =>
      api.notify(`#${entity.id}:signUpSubmit`, {
        password: field(data, "password"),
      }),
    )}
  >
    <h1>${t("auth.signUpTitle")}</h1>
    <p>${entity.email}</p>
    ${Input.render({
      name: "password",
      inputType: "password",
      label: t("auth.newPassword"),
      hint: t("auth.passwordHint"),
      autocomplete: "new-password",
      isRequired: true,
      isFullWidth: true,
    })}
    ${Button.render({
      buttonType: "submit",
      color: "primary",
      isFullWidth: true,
      isDisabled: entity.status === "loading",
      children: t("auth.signUp"),
    })}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:signInShow`),
      children: t("auth.signInOffer"),
    })}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:back`),
      children: t("auth.change"),
    })}
  </form>`
}

function resetStep(entity: AppAuthEntity, api: AppApi) {
  return html`<form
    @submit=${onSubmit((data) =>
      api.notify(`#${entity.id}:resetSubmit`, {
        code: field(data, "code"),
        password: field(data, "password"),
      }),
    )}
  >
    <h1>${t("auth.resetTitle")}</h1>
    <p>${t("auth.codeSent", { email: entity.email })}</p>
    ${Input.render({
      name: "code",
      inputType: "text",
      label: t("auth.code"),
      inputMode: "numeric",
      autocomplete: "one-time-code",
      isRequired: true,
      isFullWidth: true,
    })}
    ${Input.render({
      name: "password",
      inputType: "password",
      label: t("auth.newPassword"),
      hint: t("auth.passwordHint"),
      autocomplete: "new-password",
      isRequired: true,
      isFullWidth: true,
    })}
    ${Button.render({
      buttonType: "submit",
      color: "primary",
      isFullWidth: true,
      isDisabled: entity.status === "loading",
      children: t("auth.reset"),
    })}
    ${resendAction(entity, api)}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:back`),
      children: t("auth.change"),
    })}
  </form>`
}

function codeStep(entity: AppAuthEntity, api: AppApi) {
  return html`<form
    @submit=${onSubmit((data) =>
      api.notify(`#${entity.id}:codeSubmit`, field(data, "code")),
    )}
  >
    <h1>${t("auth.codeTitle")}</h1>
    <p>${t("auth.codeSent", { email: entity.email })}</p>
    ${Input.render({
      name: "code",
      inputType: "text",
      label: t("auth.code"),
      inputMode: "numeric",
      autocomplete: "one-time-code",
      isRequired: true,
      isFullWidth: true,
    })}
    ${Button.render({
      buttonType: "submit",
      color: "primary",
      isFullWidth: true,
      isDisabled: entity.status === "loading",
      children: t("auth.continue"),
    })}
    ${resendAction(entity, api)}
    ${Button.render({
      variant: "ghost",
      onClick: () => api.notify(`#${entity.id}:back`),
      children: t("auth.change"),
    })}
  </form>`
}

function account(entity: AppAuthEntity, api: AppApi) {
  return html`<section class="app-profile">
    <h1>${t("auth.profile")}</h1>
    <p>${t("auth.signedInAs", { email: entity.user?.email })}</p>
    ${language(api)}
    ${Button.render({
      variant: "outline",
      onClick: () => api.notify(`#${entity.id}:signOut`),
      children: t("auth.signOut"),
    })}
    ${Button.render({
      variant: "outline",
      color: "error",
      onClick: () => api.notify(`#${entity.id}:accountEraseAsk`),
      children: t("auth.erase"),
    })}
    ${ConfirmDialog.render({
      isOpen: entity.isEraseAsked,
      message: t("auth.eraseConfirm"),
      confirmLabel: t("auth.eraseYes"),
      cancelLabel: t("auth.cancel"),
      tone: "danger",
      isBusy: entity.status === "loading",
      onConfirm: () => api.notify(`#${entity.id}:accountErase`),
      onCancel: () => api.notify(`#${entity.id}:accountEraseCancel`),
      children: errorMessage(entity),
    })}
  </section>`
}

// Chosen once, so it lives here rather than in the app bar.
function language(api: AppApi) {
  const i18n = api.getEntity("i18n")!
  return Select.render({
    label: t("language"),
    value: i18n.locale,
    options: i18n.languages,
    onChange: (locale) => api.notify("#i18n:localeChange", locale),
  })
}

function errorMessage(entity: AppAuthEntity) {
  if (!entity.error) return nothing
  return Alert.render({
    severity: "error",
    description: t(`auth.errors.${entity.error}`),
  })
}

// When an address outside SAIT goes on to create an account, or fails to.
function saitHint(entity: AppAuthEntity) {
  const isRelevant = entity.step === "signUp" || Boolean(entity.error)
  if (!entity.isOutsideSait || !isRelevant) return nothing
  return Alert.render({ severity: "info", description: t("auth.outsideSait") })
}

function resendAction(entity: AppAuthEntity, api: AppApi) {
  if (entity.isCodeResent) return html`<p>${t("auth.resent")}</p>`
  return Button.render({
    variant: "ghost",
    onClick: () => api.notify(`#${entity.id}:codeResend`),
    children: t("auth.resend"),
  })
}

// Reads the fields when the form is sent, rather than every keystroke.
function onSubmit(handle: (data: FormData) => void) {
  return (event: SubmitEvent) => {
    event.preventDefault()
    handle(new FormData(event.target as HTMLFormElement))
  }
}

function field(data: FormData, name: string) {
  return String(data.get(name) ?? "")
}
