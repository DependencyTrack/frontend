/**
 * Returns a `$t` stand-in that echoes the translation key, so assertions stay
 * independent of the contents of src/i18n/locales.
 *
 * Interpolation params are appended as JSON rather than dropped, which is what
 * makes escaping of user-supplied values assertable (e.g. the field name in
 * `message.table_sort_preference_reset`).
 */
export function createTranslateStub() {
  return jest.fn((key, params) =>
    params === undefined ? key : `${key} ${JSON.stringify(params)}`,
  );
}
