import { backendUrl } from "@inglorious/supabase"
import { createClient } from "@supabase/supabase-js"

// On a phone running the app from this computer's dev server, backendUrl
// reaches the local Supabase at this computer's address.
export const supabase = createClient(
  backendUrl(import.meta.env.VITE_SUPABASE_URL),
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
