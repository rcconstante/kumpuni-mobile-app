/**
 * Returns the URL only if it is a safe, navigable http/https URL.
 * Used everywhere we render user-controlled URLs as `<a href>` or `Linking.openURL`
 * to prevent javascript:, data:, file:, blob:, intent: scheme XSS / RCE.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Reject control chars / whitespace inside the scheme portion
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Same as safeHttpUrl but tailored for `<img src>` rendering. Allows http/https
 * only — never data:, blob:, javascript:.
 */
export function safeImageUrl(value: string | null | undefined): string | null {
  return safeHttpUrl(value);
}
