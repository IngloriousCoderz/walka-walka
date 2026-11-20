import type { InboxItem, NotificationRow } from "../../types/inbox"
import { supabase } from "./supabase"

type Client = typeof supabase

// Enough to scroll back a few weeks: older ones are history nobody opens.
const INBOX_SIZE = 50

// The signed-in student's notifications, newest first. RLS keeps everyone
// else's out.
export async function inbox(client: Client = supabase) {
  const { data, error } = await client
    .from("notifications")
    .select("id, title, body, url, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(INBOX_SIZE)
  if (error) throw error
  return (data as NotificationRow[]).map(toInboxItem)
}

// Marks some notifications read, or all of them without ids.
export async function markRead(ids?: string[], client: Client = supabase) {
  let query = client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
  if (ids) query = query.in("id", ids)
  const { error } = await query
  if (error) throw error
}

export function toInboxItem(row: NotificationRow): InboxItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    url: row.url,
    createdAt: row.created_at,
    isRead: row.read_at !== null,
  }
}
