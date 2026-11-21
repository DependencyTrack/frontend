import { isActiveStatus, pollDelay } from './bomProcessing';

export const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Polls the processing status of BOM upload tokens.
 *
 * There is at most one poll loop per token, shared by all subscribers.
 * A loop ends when the status is terminal or unknown (the server forgets
 * tokens after a while), when too many requests in a row fail,
 * or when the last subscriber leaves. A 4xx response ends it at once, as a retry cannot help.
 *
 * Listeners receive `{ status, processing, final }`, or `{ error: true, final: true }`
 * when the loop gave up. `status` is undefined for an unknown token.
 *
 * @param {(token: string) => Promise<{processing: boolean, status?: string}>} fetchStatus
 */
export function createStatusPoller(fetchStatus) {
  const loops = new Map();

  function stop(token) {
    const loop = loops.get(token);
    if (!loop) return;
    clearTimeout(loop.timer);
    loops.delete(token);
  }

  function publish(loop, result) {
    for (const listener of [...loop.listeners]) listener(result);
  }

  async function poll(token, loop) {
    let result;
    try {
      const response = await fetchStatus(token);
      result = {
        status: response.status,
        processing: !!response.processing,
        final: !isActiveStatus(response.status),
      };
      loop.consecutiveErrors = 0;
    } catch (error) {
      loop.consecutiveErrors++;
      // A refusal such as 403 or 404 gives the same answer next time.
      // Network errors and server errors may pass.
      const status = error?.response?.status;
      const retryable = !(status >= 400 && status < 500);
      result =
        !retryable || loop.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS
          ? { error: true, final: true }
          : null;
    }
    if (loops.get(token) !== loop) return;
    if (result) {
      loop.last = result;
      if (result.final) stop(token);
      publish(loop, result);
      if (result.final) return;
    }
    loop.timer = setTimeout(() => poll(token, loop), pollDelay(loop.attempt++));
  }

  function subscribe(token, listener) {
    let loop = loops.get(token);
    if (!loop) {
      loop = {
        listeners: new Set(),
        timer: null,
        attempt: 0,
        consecutiveErrors: 0,
        last: null,
      };
      loops.set(token, loop);
      loop.listeners.add(listener);
      loop.timer = setTimeout(() => poll(token, loop), 0);
    } else {
      loop.listeners.add(listener);
      if (loop.last) listener(loop.last);
    }
    return () => {
      loop.listeners.delete(listener);
      if (loop.listeners.size === 0 && loops.get(token) === loop) stop(token);
    };
  }

  return { subscribe };
}
