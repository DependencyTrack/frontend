/**
 * Collapses whitespace runs so `toContain` assertions against the multi-line
 * template literals in src/shared/common.js stay readable and stable.
 */
export function normalizeHtml(html) {
  return String(html).replace(/\s+/g, ' ').trim();
}
