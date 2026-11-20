import { firebasePush } from "@inglorious/firebase/push"

import { firebaseConfig } from "./firebase"
import { supabase } from "./supabase"

export const push = firebasePush({
  firebase: firebaseConfig,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  saveToken,
  deleteToken,
  tokenKey: "walka-walka-push-token",
})

async function saveToken(token: string, platform: string) {
  const { error } = await supabase.rpc("save_push_token", {
    p_token: token,
    p_platform: platform,
  })
  if (error) throw error
}

async function deleteToken(token: string) {
  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("token", token)
  if (error) throw error
}

// The token goes first: only its signed-in user may delete it.
export async function signOut() {
  await push.unregister().catch(() => {})
  await supabase.auth.signOut()
}
