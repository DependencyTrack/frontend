import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_CONSECUTIVE_ERRORS, createStatusPoller } from './bomStatusPoller';
import { pollDelay } from './bomProcessing';

const running = { processing: true, status: 'RUNNING' };
const completed = { processing: false, status: 'COMPLETED' };
const failed = { processing: false, status: 'FAILED' };
const unknown = { processing: false };

function sequence(...results) {
  let index = 0;
  return vi.fn(async () => {
    const next = results[Math.min(index++, results.length - 1)];
    if (next instanceof Error) throw next;
    return next;
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createStatusPoller', () => {
  it('polls immediately and reports the result', async () => {
    const fetchStatus = sequence(running);
    const poller = createStatusPoller(fetchStatus);
    const listener = vi.fn();
    poller.subscribe('t', listener);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(fetchStatus).toHaveBeenCalledWith('t');
    expect(listener).toHaveBeenCalledWith({
      status: 'RUNNING',
      processing: true,
      final: false,
    });
  });

  it('backs off between polls', async () => {
    const fetchStatus = sequence(running);
    const poller = createStatusPoller(fetchStatus);
    poller.subscribe('t', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(pollDelay(0) - 1);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(pollDelay(1) - 1);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchStatus).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['COMPLETED', completed],
    ['FAILED', failed],
  ])('stops after %s', async (_name, terminal) => {
    const fetchStatus = sequence(running, terminal);
    const poller = createStatusPoller(fetchStatus);
    const listener = vi.fn();
    poller.subscribe('t', listener);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({
      status: terminal.status,
      processing: false,
      final: true,
    });
  });

  it('stops without an error when the token is unknown', async () => {
    const fetchStatus = sequence(unknown);
    const poller = createStatusPoller(fetchStatus);
    const listener = vi.fn();
    poller.subscribe('t', listener);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      status: undefined,
      processing: false,
      final: true,
    });
  });

  it('runs one poller per token however many components subscribe', async () => {
    const fetchStatus = sequence(running, completed);
    const poller = createStatusPoller(fetchStatus);
    const first = vi.fn();
    const second = vi.fn();
    poller.subscribe('t', first);
    poller.subscribe('t', second);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(pollDelay(0));
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    for (const listener of [first, second]) {
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'COMPLETED', final: true }),
      );
    }
  });

  it('replays the latest result to a late subscriber without polling again', async () => {
    const fetchStatus = sequence(running);
    const poller = createStatusPoller(fetchStatus);
    poller.subscribe('t', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    const late = vi.fn();
    poller.subscribe('t', late);
    expect(late).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'RUNNING' }),
    );
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it('polls different tokens independently', async () => {
    const fetchStatus = sequence(running);
    const poller = createStatusPoller(fetchStatus);
    poller.subscribe('a', vi.fn());
    poller.subscribe('b', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchStatus.mock.calls.map(([token]) => token).sort()).toEqual([
      'a',
      'b',
    ]);
  });

  it('stops polling once the last subscriber leaves', async () => {
    const fetchStatus = sequence(running);
    const poller = createStatusPoller(fetchStatus);
    const unsubscribeFirst = poller.subscribe('t', vi.fn());
    const unsubscribeSecond = poller.subscribe('t', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    unsubscribeFirst();
    await vi.advanceTimersByTimeAsync(pollDelay(0));
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    unsubscribeSecond();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });

  it('ignores a response that arrives after the last subscriber left', async () => {
    let resolve;
    const fetchStatus = vi.fn(() => new Promise((r) => (resolve = r)));
    const poller = createStatusPoller(fetchStatus);
    const listener = vi.fn();
    const unsubscribe = poller.subscribe('t', listener);
    await vi.advanceTimersByTimeAsync(0);
    unsubscribe();
    resolve(running);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(listener).not.toHaveBeenCalled();
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it('keeps polling through a transient error', async () => {
    const fetchStatus = sequence(new Error('network'), completed);
    const poller = createStatusPoller(fetchStatus);
    const listener = vi.fn();
    poller.subscribe('t', listener);
    await vi.advanceTimersByTimeAsync(pollDelay(0));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'COMPLETED', final: true }),
    );
  });

  it('gives up after repeated errors and says so', async () => {
    const fetchStatus = sequence(new Error('network'));
    const poller = createStatusPoller(fetchStatus);
    const listener = vi.fn();
    poller.subscribe('t', listener);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(fetchStatus).toHaveBeenCalledTimes(MAX_CONSECUTIVE_ERRORS);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ error: true, final: true });
  });

  it('starts a fresh poll when subscribing again after the token finished', async () => {
    const fetchStatus = sequence(completed);
    const poller = createStatusPoller(fetchStatus);
    poller.subscribe('t', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    poller.subscribe('t', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });
});
