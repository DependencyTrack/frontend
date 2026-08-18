/**
 * Points the jsdom window at a different path without replacing
 * window.location, which keeps origin intact and avoids the brittle
 * `delete window.location` pattern.
 *
 * The URL is reset by the global afterEach in tests/setup.js.
 */
export function setLocation(pathAndQuery) {
  window.history.replaceState({}, '', pathAndQuery);
}
