import {
  BOM_UPLOAD,
  TAG_MANAGEMENT_DELETE,
  VIEW_PORTFOLIO,
  clearPermissions,
  getPermissions,
  getToken,
  hasPermission,
  storePermissions,
} from '@/shared/permissions';
import {
  sessionStorageSnapshot,
  storePermissionsRaw,
} from '../../support/storage';

// sessionStorage is cleared by the global afterEach in tests/setup.js.
describe('shared/permissions', () => {
  describe('getPermissions', () => {
    it('returns an empty array when nothing is stored', () => {
      expect(getPermissions()).toEqual([]);
    });

    it('returns the stored permissions', () => {
      storePermissions([BOM_UPLOAD, VIEW_PORTFOLIO]);

      expect(getPermissions()).toEqual([BOM_UPLOAD, VIEW_PORTFOLIO]);
    });

    it('returns an empty array for malformed JSON', () => {
      storePermissionsRaw('not json');

      expect(getPermissions()).toEqual([]);
    });

    it('returns an empty array when the stored value is an object', () => {
      storePermissionsRaw('{"a":1}');

      expect(getPermissions()).toEqual([]);
    });

    it('returns an empty array when the stored value is a string', () => {
      storePermissionsRaw('"BOM_UPLOAD"');

      expect(getPermissions()).toEqual([]);
    });

    it('returns an empty array when the stored value is null', () => {
      storePermissionsRaw('null');

      expect(getPermissions()).toEqual([]);
    });
  });

  describe('storePermissions', () => {
    it('writes the permissions as JSON', () => {
      storePermissions([BOM_UPLOAD]);

      expect(sessionStorage.getItem('permissions')).toBe('["BOM_UPLOAD"]');
    });

    it('writes an empty array unchanged', () => {
      storePermissions([]);

      expect(sessionStorage.getItem('permissions')).toBe('[]');
    });

    it.each([
      ['a string', 'BOM_UPLOAD'],
      ['an object', { BOM_UPLOAD: true }],
      ['null', null],
      ['undefined', undefined],
    ])('ignores %s', (_label, value) => {
      storePermissions(value);

      expect(sessionStorageSnapshot()).toEqual({});
    });
  });

  describe('hasPermission', () => {
    beforeEach(() => {
      storePermissions([BOM_UPLOAD, VIEW_PORTFOLIO]);
    });

    it('returns true for a granted permission', () => {
      expect(hasPermission(BOM_UPLOAD)).toBe(true);
    });

    it('returns false for a permission that was not granted', () => {
      expect(hasPermission(TAG_MANAGEMENT_DELETE)).toBe(false);
    });

    it('returns true when any permission in the array is granted', () => {
      expect(hasPermission([TAG_MANAGEMENT_DELETE, VIEW_PORTFOLIO])).toBe(true);
    });

    it('returns false when none of the permissions in the array is granted', () => {
      expect(hasPermission([TAG_MANAGEMENT_DELETE, 'UNKNOWN'])).toBe(false);
    });

    it('returns false for an empty array', () => {
      expect(hasPermission([])).toBe(false);
    });

    it('returns undefined for an argument that is neither string nor array', () => {
      // There is no else branch, so the function falls off the end. Pinned so a
      // future change to the contract is a deliberate one.
      expect(hasPermission(42)).toBeUndefined();
    });
  });

  describe('clearPermissions', () => {
    it('removes the permissions but leaves the token in place', () => {
      storePermissions([BOM_UPLOAD]);
      sessionStorage.setItem('token', 'a-token');

      clearPermissions();

      expect(sessionStorageSnapshot()).toEqual({ token: 'a-token' });
    });
  });

  describe('getToken', () => {
    it('returns null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns the stored token', () => {
      sessionStorage.setItem('token', 'a-token');

      expect(getToken()).toBe('a-token');
    });
  });

  describe('permission constants', () => {
    // Each constant carries its own name as its value, which is what the API
    // expects; a typo during a rename would break authorization silently.
    it.each([
      ['BOM_UPLOAD', BOM_UPLOAD],
      ['VIEW_PORTFOLIO', VIEW_PORTFOLIO],
      ['TAG_MANAGEMENT_DELETE', TAG_MANAGEMENT_DELETE],
    ])('%s equals its own name', (name, value) => {
      expect(value).toBe(name);
    });
  });
});
