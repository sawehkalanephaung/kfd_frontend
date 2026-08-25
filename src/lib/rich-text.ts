/**
 * Extracts a plain-text preview from a department's `bodyContent` field,
 * which is a JSON-encoded rich-text blob (`{ richText: "<p>...</p>" }` or
 * similar), not a plain description — there's no dedicated summary field on
 * the department DTO. Used for card blurbs instead of a fabricated one.
 */
export function extractPlainExcerpt(
  bodyContent: string | null | undefined,
  maxLength = 160
): string {
  if (!bodyContent) return "";
  let text = bodyContent;
  try {
    const parsed = JSON.parse(bodyContent);
    text = parsed.richText || parsed.en || bodyContent;
  } catch {
    // bodyContent wasn't JSON — use it as-is
  }
  const plain = text.replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim();
  if (!plain) return "";
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
}
