// Remembers which BOM uploads are being processed, per project, for the
// duration of the browser session, so that progress survives navigation
// and page reloads.
//
// Storage can be unavailable or throw, in which case tracking
// still works for as long as the page is open.

const STORAGE_KEY = 'dtrack.bomUploads';

let memory = {};

function storage() {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

function readAll() {
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        memory = parsed;
      }
    }
  } catch {
    // Unreadable storage falls back to what this page remembers.
  }
  return memory;
}

function writeAll(uploads) {
  memory = uploads;
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(uploads));
  } catch {
    // Quota or access errors only cost persistence across reloads.
  }
}

/**
 * Starts tracking an upload, replacing any earlier one for the same project.
 *
 * @param {{token: string, projectUuid: string, projectName?: string,
 *   projectVersion?: string, startedAt: number}} upload
 */
export function trackUpload(upload) {
  writeAll({ ...readAll(), [upload.projectUuid]: upload });
}

export function getTrackedUpload(projectUuid) {
  return readAll()[projectUuid] ?? null;
}

export function listTrackedUploads() {
  return Object.values(readAll());
}

export function clearTrackedUploads() {
  writeAll({});
}

export function untrackUpload(projectUuid) {
  const remaining = { ...readAll() };
  delete remaining[projectUuid];
  writeAll(remaining);
}
