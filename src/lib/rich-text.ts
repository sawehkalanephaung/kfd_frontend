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
  const plain = text
    .replace(/<[^>]*>/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return "";
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
}

/**
 * Turns non-breaking spaces in editor HTML back into ordinary spaces.
 * Text pasted into the rich-text editor arrives with `&nbsp;` between words,
 * which makes a whole paragraph one unbreakable run — the browser then has to
 * split it mid-word at the end of each line ("promo" / "te").
 */
export function normalizeRichTextSpaces(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/&nbsp;|\u00a0/gi, ' ');
}

/**
 * Prepares editor-authored HTML for display: ordinary spaces (see
 * `normalizeRichTextSpaces`) and a guaranteed `alt` on every image.
 *
 * The editor does not prompt for alt text, so images arrive without it and
 * screen readers fall back to reading the file name (or a base64 string).
 * An empty alt marks the image as decorative, which is the correct default
 * until an author supplies a description. Use this for rendering only;
 * saving uses `normalizeRichTextSpaces`, so no empty alt is ever persisted.
 */
export function renderRichText(html: string | null | undefined): string {
  return normalizeRichTextSpaces(html).replace(/<img\b(?![^>]*\balt\s*=)/gi, '<img alt=""');
}
