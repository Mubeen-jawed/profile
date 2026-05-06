export const BLOCKED_USERNAMES: ReadonlySet<string> = new Set([
  // "jumpy_paramedic2552",
  // "no-tiger7949",
  "just_a_freak_teen",
  // "healthy-welcome-3518",
]);

export function isBlockedUsername(username: string): boolean {
  return BLOCKED_USERNAMES.has(username.trim().toLowerCase());
}
