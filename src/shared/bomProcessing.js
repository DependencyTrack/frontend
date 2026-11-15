// Pure helpers for presenting the processing state of an uploaded BOM.

export const MIN_POLL_DELAY_MS = 2000;
export const MAX_POLL_DELAY_MS = 10000;
const POLL_BACKOFF_FACTOR = 1.5;

const VIEWS = {
  PENDING: { kind: 'queued', variant: 'info', role: 'status' },
  RUNNING: { kind: 'running', variant: 'info', role: 'status' },
  COMPLETED: { kind: 'completed', variant: 'success', role: 'status' },
  FAILED: { kind: 'failed', variant: 'danger', role: 'alert' },
};

const UNKNOWN_VIEW = { kind: 'unknown', variant: 'secondary', role: 'status' };

/**
 * Maps a processing status of the token endpoint to how the UI presents it.
 * The status is absent when the server no longer knows the token.
 */
export function statusView(status) {
  return VIEWS[status] ?? UNKNOWN_VIEW;
}

export function isActiveStatus(status) {
  return status === 'PENDING' || status === 'RUNNING';
}

export function isTerminalStatus(status) {
  return status === 'COMPLETED' || status === 'FAILED';
}

/**
 * Describes the time elapsed since `startedAt` as an i18n key
 * and the count to interpolate as `n`, mirroring the `relative_*` messages.
 */
export function elapsedSince(startedAt, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  if (seconds < 10) return { key: 'relative_just_now', n: undefined };
  if (seconds < 60) return { key: 'relative_seconds_ago', n: seconds };
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { key: 'relative_minutes_ago', n: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { key: 'relative_hours_ago', n: hours };
  return { key: 'relative_days_ago', n: Math.floor(hours / 24) };
}

/**
 * Delay before poll number `attempt` (0-based) after the first one.
 */
export function pollDelay(attempt) {
  return Math.min(
    MAX_POLL_DELAY_MS,
    Math.round(MIN_POLL_DELAY_MS * POLL_BACKOFF_FACTOR ** attempt),
  );
}
