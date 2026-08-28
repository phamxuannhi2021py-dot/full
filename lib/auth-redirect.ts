export function safeNextPath(value: string | null | undefined, origin: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;

  try {
    const parsed = new URL(value, origin);
    if (parsed.origin !== origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}
