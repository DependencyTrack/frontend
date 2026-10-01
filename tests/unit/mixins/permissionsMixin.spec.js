import { mount } from '@vue/test-utils';
import permissionsMixin from '@/mixins/permissionsMixin';
import * as permissions from '@/shared/permissions';
import {
  BOM_UPLOAD,
  TAG_MANAGEMENT_DELETE,
  VIEW_PORTFOLIO,
  storePermissions,
} from '@/shared/permissions';

describe('mixins/permissionsMixin', () => {
  const createHost = () =>
    mount({
      mixins: [permissionsMixin],
      render: (h) => h('div'),
    });

  let vm;

  beforeEach(() => {
    storePermissions([BOM_UPLOAD, VIEW_PORTFOLIO]);
    vm = createHost().vm;
  });

  describe('isPermitted', () => {
    it('returns true for a granted permission', () => {
      expect(vm.isPermitted(BOM_UPLOAD)).toBe(true);
    });

    it('returns false for a permission that was not granted', () => {
      expect(vm.isPermitted(TAG_MANAGEMENT_DELETE)).toBe(false);
    });

    it('returns true when any permission in the array is granted', () => {
      expect(vm.isPermitted([TAG_MANAGEMENT_DELETE, VIEW_PORTFOLIO])).toBe(
        true,
      );
    });

    it('returns false when none of the permissions in the array is granted', () => {
      expect(vm.isPermitted([TAG_MANAGEMENT_DELETE, 'UNKNOWN'])).toBe(false);
    });

    it('returns false for an empty array', () => {
      expect(vm.isPermitted([])).toBe(false);
    });
  });

  describe('isNotPermitted', () => {
    it('returns false for a granted permission', () => {
      expect(vm.isNotPermitted(BOM_UPLOAD)).toBe(false);
    });

    it('returns true for a permission that was not granted', () => {
      expect(vm.isNotPermitted(TAG_MANAGEMENT_DELETE)).toBe(true);
    });

    it('returns false when any permission in the array is granted', () => {
      expect(vm.isNotPermitted([TAG_MANAGEMENT_DELETE, VIEW_PORTFOLIO])).toBe(
        false,
      );
    });

    it('returns true when none of the permissions in the array is granted', () => {
      expect(vm.isNotPermitted([TAG_MANAGEMENT_DELETE, 'UNKNOWN'])).toBe(true);
    });

    it('returns true for an empty array', () => {
      expect(vm.isNotPermitted([])).toBe(true);
    });
  });

  describe('argument validation', () => {
    const message = 'permission must be of type string or array';

    it.each([
      ['a number', 42],
      ['null', null],
      ['undefined', undefined],
    ])('rejects %s in isPermitted', (_label, value) => {
      expect(() => vm.isPermitted(value)).toThrow(message);
    });

    it.each([
      ['a number', 42],
      ['null', null],
      ['undefined', undefined],
    ])('rejects %s in isNotPermitted', (_label, value) => {
      expect(() => vm.isNotPermitted(value)).toThrow(message);
    });
  });

  describe('the PERMISSIONS map', () => {
    it('exposes every permission the shared module defines', () => {
      // The map is maintained by hand, so a permission added to the shared
      // module can easily be left unreachable from templates.
      const declared = Object.entries(permissions)
        .filter(([, value]) => typeof value === 'string')
        .map(([key]) => key);

      expect(Object.keys(vm.PERMISSIONS).sort()).toEqual(declared.sort());
    });

    it('maps every key to its own name', () => {
      Object.entries(vm.PERMISSIONS).forEach(([key, value]) => {
        expect(value).toBe(key);
      });
    });
  });
});
