export function seedLocalStorage(entries) {
  Object.entries(entries).forEach(([key, value]) =>
    localStorage.setItem(key, value),
  );
}

/**
 * Returns the whole of localStorage as a plain object, so a single toEqual can
 * prove both what a function removed and what it left untouched.
 */
export function localStorageSnapshot() {
  const snapshot = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    snapshot[key] = localStorage.getItem(key);
  }
  return snapshot;
}

export function sessionStorageSnapshot() {
  const snapshot = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    snapshot[key] = sessionStorage.getItem(key);
  }
  return snapshot;
}

/**
 * Writes the raw permissions entry, bypassing storePermissions() so malformed
 * payloads can be tested.
 */
export function storePermissionsRaw(value) {
  sessionStorage.setItem('permissions', value);
}
