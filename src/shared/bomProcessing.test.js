import { describe, expect, it } from 'vitest';
import {
  MAX_POLL_DELAY_MS,
  MIN_POLL_DELAY_MS,
  elapsedSince,
  formatBytes,
  isActiveStatus,
  isTerminalStatus,
  pollDelay,
  statusView,
} from './bomProcessing';

describe('statusView', () => {
  it.each([
    ['PENDING', 'queued', 'info'],
    ['RUNNING', 'running', 'info'],
    ['COMPLETED', 'completed', 'success'],
    ['FAILED', 'failed', 'danger'],
  ])('maps %s to %s', (status, kind, variant) => {
    expect(statusView(status)).toMatchObject({ kind, variant });
  });

  it.each([undefined, null, '', 'SOMETHING_NEW'])(
    'maps %j to unknown',
    (status) => {
      expect(statusView(status)).toMatchObject({ kind: 'unknown' });
    },
  );

  it('classifies active and terminal states', () => {
    expect(isActiveStatus('PENDING')).toBe(true);
    expect(isActiveStatus('RUNNING')).toBe(true);
    expect(isActiveStatus('COMPLETED')).toBe(false);
    expect(isActiveStatus(undefined)).toBe(false);
    expect(isTerminalStatus('COMPLETED')).toBe(true);
    expect(isTerminalStatus('FAILED')).toBe(true);
    expect(isTerminalStatus('RUNNING')).toBe(false);
    expect(isTerminalStatus(undefined)).toBe(false);
  });

  it('uses a role that announces failures assertively', () => {
    expect(statusView('RUNNING').role).toBe('status');
    expect(statusView('COMPLETED').role).toBe('status');
    expect(statusView('FAILED').role).toBe('alert');
  });
});

describe('elapsedSince', () => {
  const started = Date.parse('2026-01-01T10:00:00Z');
  const at = (seconds) => started + seconds * 1000;

  it.each([
    [0, 'relative_just_now', undefined],
    [9, 'relative_just_now', undefined],
    [10, 'relative_seconds_ago', 10],
    [59, 'relative_seconds_ago', 59],
    [60, 'relative_minutes_ago', 1],
    [4 * 60 + 30, 'relative_minutes_ago', 4],
    [3600, 'relative_hours_ago', 1],
    [26 * 3600, 'relative_days_ago', 1],
  ])('after %i seconds yields %s', (seconds, key, n) => {
    expect(elapsedSince(started, at(seconds))).toEqual({ key, n });
  });

  it('never goes negative when the clock is behind', () => {
    expect(elapsedSince(at(30), started).key).toBe('relative_just_now');
  });
});

describe('pollDelay', () => {
  it('starts at the minimum and grows without exceeding the maximum', () => {
    const delays = Array.from({ length: 12 }, (_, attempt) =>
      pollDelay(attempt),
    );
    expect(delays[0]).toBe(MIN_POLL_DELAY_MS);
    expect(MIN_POLL_DELAY_MS).toBe(2000);
    expect(MAX_POLL_DELAY_MS).toBe(10000);
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
      expect(delays[i]).toBeLessThanOrEqual(MAX_POLL_DELAY_MS);
    }
    expect(delays[11]).toBe(MAX_POLL_DELAY_MS);
    expect(delays[1]).toBeGreaterThan(delays[0]);
  });
});

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [999, '999 B'],
    [1024, '1.0 KB'],
    [1536, '1.5 KB'],
    [39 * 1024 * 1024, '39.0 MB'],
    [12.34 * 1024 * 1024, '12.3 MB'],
    [3 * 1024 ** 3, '3.0 GB'],
  ])('formats %i bytes as %s', (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text);
  });

  it('treats a missing size as zero', () => {
    expect(formatBytes(undefined)).toBe('0 B');
  });
});
