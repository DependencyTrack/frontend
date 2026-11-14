import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PORTFOLIO_MANAGEMENT,
  PORTFOLIO_MANAGEMENT_READ,
  VIEW_PORTFOLIO,
  clearPermissions,
  getPermissions,
  hasPermission,
  storePermissions,
} from './permissions';

function stubSessionStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const storage = {
    getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key, value) => data.set(key, String(value))),
    removeItem: vi.fn((key) => data.delete(key)),
  };
  vi.stubGlobal('sessionStorage', storage);
  return storage;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getPermissions', () => {
  it('returns the stored permissions', () => {
    stubSessionStorage({ permissions: JSON.stringify([VIEW_PORTFOLIO]) });
    expect(getPermissions()).toEqual([VIEW_PORTFOLIO]);
  });

  it('returns an empty array when nothing is stored', () => {
    stubSessionStorage();
    expect(getPermissions()).toEqual([]);
  });

  it('returns an empty array for an empty string', () => {
    stubSessionStorage({ permissions: '' });
    expect(getPermissions()).toEqual([]);
  });

  it('returns an empty array for corrupt JSON', () => {
    stubSessionStorage({ permissions: '{not json' });
    expect(getPermissions()).toEqual([]);
  });

  it.each([
    ['an object', '{"VIEW_PORTFOLIO":true}'],
    ['a string', '"VIEW_PORTFOLIO"'],
    ['a number', '42'],
    ['true', 'true'],
    ['null', 'null'],
  ])('returns an empty array when the stored JSON is %s', (_d, stored) => {
    stubSessionStorage({ permissions: stored });
    expect(getPermissions()).toEqual([]);
  });

  it('returns an empty array when sessionStorage throws', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('denied');
      },
    });
    expect(getPermissions()).toEqual([]);
  });
});

describe('storePermissions', () => {
  it('serialises the permissions into sessionStorage', () => {
    const storage = stubSessionStorage();
    storePermissions([VIEW_PORTFOLIO, PORTFOLIO_MANAGEMENT]);
    expect(storage.setItem).toHaveBeenCalledWith(
      'permissions',
      JSON.stringify([VIEW_PORTFOLIO, PORTFOLIO_MANAGEMENT]),
    );
    expect(getPermissions()).toEqual([VIEW_PORTFOLIO, PORTFOLIO_MANAGEMENT]);
  });

  it('stores an empty array', () => {
    const storage = stubSessionStorage();
    storePermissions([]);
    expect(storage.setItem).toHaveBeenCalledWith('permissions', '[]');
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a string', 'VIEW_PORTFOLIO'],
    ['an object', { VIEW_PORTFOLIO: true }],
  ])('ignores %s and leaves existing permissions untouched', (_d, value) => {
    const storage = stubSessionStorage({
      permissions: JSON.stringify([VIEW_PORTFOLIO]),
    });
    storePermissions(value);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(getPermissions()).toEqual([VIEW_PORTFOLIO]);
  });
});

describe('clearPermissions', () => {
  it('removes the stored permissions', () => {
    stubSessionStorage({ permissions: JSON.stringify([VIEW_PORTFOLIO]) });
    clearPermissions();
    expect(getPermissions()).toEqual([]);
    expect(hasPermission(VIEW_PORTFOLIO)).toBe(false);
  });
});

describe('hasPermission', () => {
  beforeEach(() => {
    stubSessionStorage({
      permissions: JSON.stringify([VIEW_PORTFOLIO, PORTFOLIO_MANAGEMENT_READ]),
    });
  });

  it('is true for a present permission', () => {
    expect(hasPermission(VIEW_PORTFOLIO)).toBe(true);
  });

  it('is false for an absent permission', () => {
    expect(hasPermission('BOM_UPLOAD')).toBe(false);
  });

  it('does no prefix or substring matching', () => {
    expect(hasPermission('VIEW')).toBe(false);
    expect(hasPermission('')).toBe(false);
  });

  it('is case sensitive', () => {
    expect(hasPermission('view_portfolio')).toBe(false);
  });

  it('does not treat the umbrella permission as implied by a granular one', () => {
    expect(hasPermission(PORTFOLIO_MANAGEMENT_READ)).toBe(true);
    expect(hasPermission(PORTFOLIO_MANAGEMENT)).toBe(false);
  });

  it('does not treat a granular permission as implied by the umbrella one', () => {
    stubSessionStorage({ permissions: JSON.stringify([PORTFOLIO_MANAGEMENT]) });
    expect(hasPermission(PORTFOLIO_MANAGEMENT)).toBe(true);
    expect(hasPermission(PORTFOLIO_MANAGEMENT_READ)).toBe(false);
  });

  describe('with an array of permissions', () => {
    it('is true when any of them is present', () => {
      expect(hasPermission(['BOM_UPLOAD', VIEW_PORTFOLIO])).toBe(true);
    });

    it('is false when none of them is present', () => {
      expect(hasPermission(['BOM_UPLOAD', PORTFOLIO_MANAGEMENT])).toBe(false);
    });

    it('is false for an empty array', () => {
      expect(hasPermission([])).toBe(false);
    });
  });

  it.each([undefined, null, 42, {}])(
    'returns undefined (falsy) for the unsupported argument %j',
    (argument) => {
      expect(hasPermission(argument)).toBeUndefined();
    },
  );

  it('is false for everything when the stored data is corrupt', () => {
    stubSessionStorage({ permissions: '{broken' });
    expect(hasPermission(VIEW_PORTFOLIO)).toBe(false);
    expect(hasPermission([VIEW_PORTFOLIO])).toBe(false);
  });
});
