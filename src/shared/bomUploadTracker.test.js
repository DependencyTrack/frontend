import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

function createStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key) => (items.has(key) ? items.get(key) : null)),
    setItem: vi.fn((key, value) => items.set(key, String(value))),
    removeItem: vi.fn((key) => items.delete(key)),
    items,
  };
}

const upload = (overrides = {}) => ({
  token: 'token-1',
  projectUuid: 'project-1',
  projectName: 'Acme',
  projectVersion: '1.0.0',
  startedAt: 1_700_000_000_000,
  ...overrides,
});

let tracker;

async function load(storage) {
  vi.resetModules();
  vi.stubGlobal('sessionStorage', storage);
  tracker = await import('./bomUploadTracker');
}

afterEach(() => vi.unstubAllGlobals());

describe('bomUploadTracker', () => {
  let storage;
  beforeEach(async () => {
    storage = createStorage();
    await load(storage);
  });

  it('returns nothing for an untracked project', () => {
    expect(tracker.getTrackedUpload('project-1')).toBeNull();
    expect(tracker.listTrackedUploads()).toEqual([]);
  });

  it('stores an upload in sessionStorage and reads it back', () => {
    tracker.trackUpload(upload());
    expect(tracker.getTrackedUpload('project-1')).toEqual(upload());
    expect(storage.setItem).toHaveBeenCalled();
    // Survives a reload: a fresh module instance reads the same storage.
    return load(storage).then(() => {
      expect(tracker.getTrackedUpload('project-1')).toEqual(upload());
    });
  });

  it('keeps one active upload per project and replaces it', () => {
    tracker.trackUpload(upload());
    tracker.trackUpload(
      upload({ token: 'token-2', startedAt: 1_800_000_000_000 }),
    );
    expect(tracker.listTrackedUploads()).toHaveLength(1);
    expect(tracker.getTrackedUpload('project-1').token).toBe('token-2');
  });

  it('tracks several projects independently', () => {
    tracker.trackUpload(upload());
    tracker.trackUpload(upload({ projectUuid: 'project-2', token: 'token-9' }));
    expect(
      tracker
        .listTrackedUploads()
        .map((u) => u.projectUuid)
        .sort(),
    ).toEqual(['project-1', 'project-2']);
    tracker.untrackUpload('project-1');
    expect(tracker.getTrackedUpload('project-1')).toBeNull();
    expect(tracker.getTrackedUpload('project-2')).not.toBeNull();
  });

  it('forgets every upload at once', async () => {
    tracker.trackUpload(upload());
    tracker.trackUpload(upload({ projectUuid: 'project-2', token: 'token-9' }));
    tracker.clearTrackedUploads();
    expect(tracker.listTrackedUploads()).toEqual([]);
    await load(storage);
    expect(tracker.listTrackedUploads()).toEqual([]);
  });

  it('ignores corrupt stored data', async () => {
    await load(createStorage({ 'dtrack.bomUploads': '{not json' }));
    expect(tracker.listTrackedUploads()).toEqual([]);
    tracker.trackUpload(upload());
    expect(tracker.getTrackedUpload('project-1')).not.toBeNull();
  });
});

describe('bomUploadTracker without usable storage', () => {
  it('falls back to memory when storage throws', async () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    await load(broken);
    expect(() => tracker.trackUpload(upload())).not.toThrow();
    expect(tracker.getTrackedUpload('project-1')).toEqual(upload());
    expect(() => tracker.untrackUpload('project-1')).not.toThrow();
    expect(tracker.getTrackedUpload('project-1')).toBeNull();
  });

  it('works when sessionStorage is not defined', async () => {
    vi.resetModules();
    vi.stubGlobal('sessionStorage', undefined);
    tracker = await import('./bomUploadTracker');
    tracker.trackUpload(upload());
    expect(tracker.listTrackedUploads()).toHaveLength(1);
  });
});
