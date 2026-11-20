import type { TemplateResult } from "@inglorious/web"

// A notifications row, as the database has it.
export interface NotificationRow {
  id: string
  title: string
  body: string
  url: string
  created_at: string
  read_at: string | null
}

// A notification, as the inbox shows it.
export interface InboxItem {
  id: string
  title: string
  body: string
  url: string
  createdAt: string
  isRead: boolean
}

export interface InboxProps {
  items: InboxItem[]
  unread: number
  now: number
  locale: string
  isLoading: boolean
  // Why the list can't show: a translation key.
  problem: string | null
  onOpen: (item: InboxItem) => void
  onReadAll: () => void
}

export type InboxTemplate = {
  renderInbox: (props: InboxProps) => TemplateResult
  renderItem: (item: InboxItem, props: InboxProps) => TemplateResult
}
