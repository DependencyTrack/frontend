import {
  asideMenuCssClasses,
  checkBreakpoint,
  sidebarCssClasses,
  validBreakpoints,
} from '@/shared/classes';

describe('shared/classes', () => {
  describe('sidebarCssClasses', () => {
    it('lists the sidebar classes from base to xl', () => {
      expect(sidebarCssClasses).toEqual([
        'sidebar-show',
        'sidebar-sm-show',
        'sidebar-md-show',
        'sidebar-lg-show',
        'sidebar-xl-show',
      ]);
    });
  });

  describe('asideMenuCssClasses', () => {
    it('lists the aside menu classes from base to xl', () => {
      expect(asideMenuCssClasses).toEqual([
        'aside-menu-show',
        'aside-menu-sm-show',
        'aside-menu-md-show',
        'aside-menu-lg-show',
        'aside-menu-xl-show',
      ]);
    });
  });

  describe('validBreakpoints', () => {
    it('lists the supported breakpoints', () => {
      expect(validBreakpoints).toEqual(['sm', 'md', 'lg', 'xl']);
    });
  });

  describe('checkBreakpoint', () => {
    it('returns true when the breakpoint is in the list', () => {
      expect(checkBreakpoint('md', validBreakpoints)).toBe(true);
    });

    it('returns true for the first entry', () => {
      expect(checkBreakpoint('sm', validBreakpoints)).toBe(true);
    });

    it('returns false when the breakpoint is not in the list', () => {
      expect(checkBreakpoint('xs', validBreakpoints)).toBe(false);
    });

    it('returns false for an empty list', () => {
      expect(checkBreakpoint('md', [])).toBe(false);
    });

    it('returns false for an undefined breakpoint', () => {
      expect(checkBreakpoint(undefined, validBreakpoints)).toBe(false);
    });
  });
});
