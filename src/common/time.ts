const MINUTE_MS = 60_000

// When a walk leaves, as people say it: "7:40", or "Tue 7:40" on another day.
export function formatDeparture(iso: string, now: number, locale: string) {
  const departs = new Date(iso)
  const isToday = departs.toDateString() === new Date(now).toDateString()
  return new Intl.DateTimeFormat(locale, {
    weekday: isToday ? undefined : "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(departs)
}

// Whole minutes from now until then: 0 or less means it's leaving now.
export function minutesUntil(iso: string, now: number) {
  return Math.round((new Date(iso).getTime() - now) / MINUTE_MS)
}

const JUST_NOW = 0
const HOUR_MINUTES = 60
const DAY_HOURS = 24

// How long ago, as people say it: "5 minutes ago", "yesterday".
export function timeAgo(iso: string, now: number, locale: string) {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const minutes = -Math.round((now - new Date(iso).getTime()) / MINUTE_MS)
  if (!minutes) return format.format(JUST_NOW, "second")
  if (minutes > -HOUR_MINUTES) return format.format(minutes, "minute")
  const hours = Math.round(minutes / HOUR_MINUTES)
  if (hours > -DAY_HOURS) return format.format(hours, "hour")
  return format.format(Math.round(hours / DAY_HOURS), "day")
}
