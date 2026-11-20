import { createCaptcha, supabaseAuth } from "@inglorious/supabase"

import { signOut } from "./push"
import { supabase } from "./supabase"

// Without a site key, as on a local stack, it asks for no CAPTCHA.
const captcha = createCaptcha({
  siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  element: "captcha",
})

// Signing out unregisters this device's push token first.
export const authAdapter = { ...supabaseAuth(supabase, { captcha }), signOut }
