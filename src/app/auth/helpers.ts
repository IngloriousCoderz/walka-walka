// The same domains as the sait_only migration, which has the last word and
// also knows the invited guests: this copy only lets the screen warn early.
const SAIT_DOMAINS = ["edu.sait.ca", "sait.ca"]

export function isSaitEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@").pop()
  return SAIT_DOMAINS.includes(domain ?? "")
}
