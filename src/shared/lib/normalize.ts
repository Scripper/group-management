// Tags: stored as lowercase, trimmed, unique.
// Emails: stored as lowercase, trimmed.

export function trimString(value: string): string {
  return value.trim();
}

export function normalizeEmail(email: string): string {
  return trimString(email).toLowerCase();
}

export function normalizeTag(tag: string): string {
  return trimString(tag).toLowerCase();
}

/** Trim, lowercase, remove empties & duplicates. */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (tag === '') continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }

  return result;
}
