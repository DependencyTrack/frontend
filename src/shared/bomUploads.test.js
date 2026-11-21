import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('axios', () => ({ default: { get } }));

const upload = {
  token: 'token-1',
  projectUuid: 'project-1',
  projectName: 'Acme',
  projectVersion: '1.0.0',
  startedAt: 1_700_000_000_000,
};

let uploads;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const items = new Map();
  vi.stubGlobal('sessionStorage', {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
  });
  get.mockReset();
  get.mockResolvedValue({ data: { processing: true, status: 'RUNNING' } });
  (await import('./globals')).default.$api = {
    BASE_URL: '',
    URL_BOM_TOKEN: 'api/v1/bom/token',
  };
  uploads = await import('./bomUploads');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('forgetAllBomUploads', () => {
  it('stops following and clears the stored uploads', async () => {
    uploads.startFollowingBomUpload(upload);
    await vi.advanceTimersByTimeAsync(0);
    expect(uploads.bomUploads['project-1'].status).toBe('RUNNING');
    const polls = get.mock.calls.length;

    uploads.forgetAllBomUploads();

    expect(Object.keys(uploads.bomUploads)).toEqual([]);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(get).toHaveBeenCalledTimes(polls);
    uploads.resumeFollowingBomUploads();
    expect(Object.keys(uploads.bomUploads)).toEqual([]);
  });

  it('marks status polls as background requests', async () => {
    uploads.startFollowingBomUpload(upload);
    await vi.advanceTimersByTimeAsync(0);
    expect(get.mock.calls[0][1]).toMatchObject({ silent: true });
  });
});
