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
