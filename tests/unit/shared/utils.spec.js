import Vue from 'vue';
import { INVALID_SORT_FIELD_PROBLEM_TYPE } from '@/shared/problemDetails';
import {
  compareVersions,
  getContextPath,
  getRedirectUrl,
  getUrlVar,
  handleTableLoadError,
  isUrlSaveForRedirect,
  loadUserPreferencesForBootstrapTable,
  random,
  shuffleArray,
} from '@/shared/utils';
import { setLocation } from '../../support/location';
import { localStorageSnapshot, seedLocalStorage } from '../../support/storage';

describe('shared/utils', () => {
  describe('isUrlSaveForRedirect', () => {
    it.each([
      '/projects',
      '/projects?foo=bar',
      '/dashboard',
      '/vulnerabilityAudit',
      '/change-password',
      '/login',
    ])('accepts the in-app path %s', (url) => {
      expect(isUrlSaveForRedirect(url)).toBe(true);
    });

    it('rejects a protocol-relative URL pointing at another host', () => {
      expect(isUrlSaveForRedirect('//evil.com/projects')).toBe(false);
    });

    it('rejects an absolute URL on another origin', () => {
      expect(isUrlSaveForRedirect('https://evil.com/projects')).toBe(false);
    });

    it('rejects a host that merely starts with the current one', () => {
      expect(isUrlSaveForRedirect('http://localhost.evil.com/projects')).toBe(
        false,
      );
    });

    it('rejects the javascript: protocol', () => {
      expect(isUrlSaveForRedirect('javascript:alert(1)')).toBe(false);
    });

    it('rejects the blob: protocol even when the origin matches', () => {
      // "blob:http://localhost/x" reports origin "http://localhost", so the
      // protocol check is what stops this one.
      expect(isUrlSaveForRedirect('blob:http://localhost/projects')).toBe(
        false,
      );
    });

    it('rejects a path outside the acceptable roots', () => {
      expect(isUrlSaveForRedirect('/evil')).toBe(false);
    });

    it('rejects an empty string', () => {
      expect(isUrlSaveForRedirect('')).toBe(false);
    });

    it('rejects a relative path without a leading slash', () => {
      expect(isUrlSaveForRedirect('projects')).toBe(false);
    });

    it('rejects null via the invalid-URL catch', () => {
      expect(isUrlSaveForRedirect(null)).toBe(false);
    });

    it('accepts a path that merely starts with an acceptable root', () => {
      // The guard uses startsWith rather than a path-segment match, so
      // "/projectsomething" slips through. Pinned so that tightening it later
      // is a deliberate, visible change.
      expect(isUrlSaveForRedirect('/projectsomething')).toBe(true);
    });

    describe('when deployed in a non-root context', () => {
      beforeEach(() => {
        setLocation('/ctx/projects');
      });

      it('accepts a path prefixed with the context', () => {
        expect(isUrlSaveForRedirect('/ctx/projects')).toBe(true);
      });

      it('rejects a path missing the context prefix', () => {
        expect(isUrlSaveForRedirect('/projects')).toBe(false);
      });
    });
  });

  describe('getContextPath', () => {
    it('returns an empty string at the site root', () => {
      expect(getContextPath()).toBe('');
    });

    it('returns an empty string for a known root path', () => {
      setLocation('/projects/1234');

      expect(getContextPath()).toBe('');
    });

    it('returns the context for a non-root deployment', () => {
      setLocation('/ctx/projects');

      expect(getContextPath()).toBe('/ctx');
    });

    it('returns the context for a non-root deployment with a trailing slash', () => {
      setLocation('/ctx/');

      expect(getContextPath()).toBe('/ctx');
    });
  });

  describe('getUrlVar', () => {
    it('returns the value of an existing query param', () => {
      setLocation('/projects?tag=prod');

      expect(getUrlVar('tag')).toBe('prod');
    });

    it('returns null for a missing query param', () => {
      setLocation('/projects?tag=prod');

      expect(getUrlVar('team')).toBeNull();
    });

    it('returns an empty string for a param without a value', () => {
      setLocation('/projects?tag=');

      expect(getUrlVar('tag')).toBe('');
    });
  });

  describe('getRedirectUrl', () => {
    const routerWithQuery = (query) => ({ currentRoute: { query } });

    it('returns the redirect when it is safe', () => {
      expect(getRedirectUrl(routerWithQuery({ redirect: '/projects' }))).toBe(
        '/projects',
      );
    });

    it('returns undefined when the redirect is unsafe', () => {
      expect(
        getRedirectUrl(routerWithQuery({ redirect: 'https://evil.com' })),
      ).toBeUndefined();
    });

    it('returns undefined when there is no redirect param', () => {
      expect(getRedirectUrl(routerWithQuery({}))).toBeUndefined();
    });
  });

  describe('compareVersions', () => {
    it('sorts a missing first version last', () => {
      expect(compareVersions(null, '1.0')).toBe(1);
    });

    it('sorts a missing second version first', () => {
      expect(compareVersions('1.0', null)).toBe(-1);
    });

    it('sorts a missing first version last even when both are missing', () => {
      expect(compareVersions(null, null)).toBe(1);
    });

    it('treats an empty string as missing', () => {
      expect(compareVersions('', '1.0')).toBe(1);
    });

    it('ignores a leading lowercase v', () => {
      expect(compareVersions('v1.0', '1.0')).toBe(0);
    });

    it('ignores a leading uppercase V', () => {
      expect(compareVersions('V1.0', '1.0')).toBe(0);
    });

    it('compares numerically rather than lexically', () => {
      expect(compareVersions('1.2', '1.10')).toBeLessThan(0);
    });

    it('returns zero for identical versions', () => {
      expect(compareVersions('2.1.0', '2.1.0')).toBe(0);
    });

    it('lets a higher epoch win over a higher version', () => {
      expect(compareVersions('1:1.0', '0:2.0')).toBeGreaterThan(0);
    });

    it('compares the version when the epochs are equal', () => {
      expect(compareVersions('1:1.0', '1:2.0')).toBeLessThan(0);
    });

    it('treats a missing epoch as zero', () => {
      expect(compareVersions('1:1.0', '1.0')).toBeGreaterThan(0);
    });
  });

  describe('random', () => {
    it('returns the lower bound when Math.random yields 0', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      expect(random(5, 10)).toBe(5);
    });

    it('returns the upper bound when Math.random approaches 1', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.999999);

      expect(random(5, 10)).toBe(10);
    });
  });

  describe('shuffleArray', () => {
    it('shuffles in place and returns the same array reference', () => {
      const array = [1, 2, 3];

      expect(shuffleArray(array)).toBe(array);
    });

    it('preserves every element', () => {
      expect(shuffleArray([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('produces a deterministic result for a stubbed Math.random', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      // With j always 0, each element is swapped with index 0 in turn.
      expect(shuffleArray(['a', 'b', 'c'])).toEqual(['b', 'c', 'a']);
    });

    it('leaves an empty array untouched', () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it('leaves a single-element array untouched', () => {
      expect(shuffleArray(['a'])).toEqual(['a']);
    });
  });

  describe('loadUserPreferencesForBootstrapTable', () => {
    const createTable = () => ({
      showColumn: jest.fn(),
      hideColumn: jest.fn(),
    });

    it('logs an error and returns when the component has no table ref', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() =>
        loadUserPreferencesForBootstrapTable({ $refs: {} }, 'myTable', [
          { field: 'name', visible: true },
        ]),
      ).not.toThrow();
      expect(consoleError).toHaveBeenCalled();
    });

    it('hides a visible column that the user turned off', () => {
      const table = createTable();
      seedLocalStorage({ myTableShowName: 'false' });

      loadUserPreferencesForBootstrapTable({ $refs: { table } }, 'myTable', [
        { field: 'name', visible: true },
      ]);

      expect(table.hideColumn).toHaveBeenCalledWith('name');
      expect(table.showColumn).not.toHaveBeenCalled();
    });

    it('shows a hidden column that the user turned on', () => {
      const table = createTable();
      seedLocalStorage({ myTableShowName: 'true' });

      loadUserPreferencesForBootstrapTable({ $refs: { table } }, 'myTable', [
        { field: 'name', visible: false },
      ]);

      expect(table.showColumn).toHaveBeenCalledWith('name');
      expect(table.hideColumn).not.toHaveBeenCalled();
    });

    it('does nothing when the stored preference matches the current state', () => {
      const table = createTable();
      seedLocalStorage({ myTableShowName: 'true' });

      loadUserPreferencesForBootstrapTable({ $refs: { table } }, 'myTable', [
        { field: 'name', visible: true },
      ]);

      expect(table.showColumn).not.toHaveBeenCalled();
      expect(table.hideColumn).not.toHaveBeenCalled();
    });

    it('falls back to the column default when nothing is stored', () => {
      const table = createTable();

      loadUserPreferencesForBootstrapTable({ $refs: { table } }, 'myTable', [
        { field: 'name', visible: true },
      ]);

      expect(table.showColumn).not.toHaveBeenCalled();
      expect(table.hideColumn).not.toHaveBeenCalled();
    });

    it('leaves a two-character field name uncapitalized in the storage key', () => {
      // common.capitalize() only acts on strings longer than two characters,
      // so the key for the "id" field is "myTableShowid", not "myTableShowId".
      const table = createTable();
      seedLocalStorage({ myTableShowid: 'false' });

      loadUserPreferencesForBootstrapTable({ $refs: { table } }, 'myTable', [
        { field: 'id', visible: true },
      ]);

      expect(table.hideColumn).toHaveBeenCalledWith('id');
    });
  });

  describe('handleTableLoadError', () => {
    let toastr;

    beforeEach(() => {
      // utils.js reads Vue.prototype.$toastr at call time, so assigning it here
      // is enough - no module mocking required.
      toastr = { w: jest.fn(), e: jest.fn() };
      Vue.prototype.$toastr = toastr;
    });

    afterEach(() => {
      delete Vue.prototype.$toastr;
    });

    const staleSortProblem = (field) => ({
      type: INVALID_SORT_FIELD_PROBLEM_TYPE,
      invalidField: field,
    });

    it('clears only the sort preference pair that matches the rejected field', () => {
      seedLocalStorage({
        ProjectsSortName: 'lastBomImport',
        ProjectsSortOrder: 'asc',
        ComponentsSortName: 'name',
        ComponentsSortOrder: 'desc',
        unrelatedPreference: 'keep-me',
      });

      const handled = handleTableLoadError(staleSortProblem('lastBomImport'));

      expect(handled).toBe(true);
      expect(localStorageSnapshot()).toEqual({
        ComponentsSortName: 'name',
        ComponentsSortOrder: 'desc',
        unrelatedPreference: 'keep-me',
      });
      expect(toastr.w).toHaveBeenCalledTimes(1);
    });

    it('clears the preferences of every view sorting by the rejected field', () => {
      // Deliberately over-broad: a different view may legitimately sort by the
      // same field, but its preference is wiped too.
      seedLocalStorage({
        ProjectsSortName: 'name',
        ProjectsSortOrder: 'asc',
        ComponentsSortName: 'name',
        ComponentsSortOrder: 'desc',
      });

      handleTableLoadError(staleSortProblem('name'));

      expect(localStorageSnapshot()).toEqual({});
    });

    it('accepts the snake_case invalid_field spelling', () => {
      seedLocalStorage({
        ProjectsSortName: 'name',
        ProjectsSortOrder: 'asc',
      });

      const handled = handleTableLoadError({
        type: INVALID_SORT_FIELD_PROBLEM_TYPE,
        invalid_field: 'name',
      });

      expect(handled).toBe(true);
      expect(localStorageSnapshot()).toEqual({});
    });

    it('escapes the field name before putting it in the toast', () => {
      handleTableLoadError(staleSortProblem('<img src=x onerror=alert(1)>'));

      const message = toastr.w.mock.calls[0][0];
      expect(message).toContain('&lt;img src=x onerror=alert(1)>');
      expect(message).not.toContain('<img');
    });

    it('leaves a sort preference whose value does not match alone', () => {
      seedLocalStorage({
        ProjectsSortName: 'name',
        ProjectsSortOrder: 'asc',
      });

      handleTableLoadError(staleSortProblem('lastBomImport'));

      expect(localStorageSnapshot()).toEqual({
        ProjectsSortName: 'name',
        ProjectsSortOrder: 'asc',
      });
    });

    it('falls back to a generic error toast for an unrelated problem', () => {
      seedLocalStorage({ ProjectsSortName: 'name' });

      const handled = handleTableLoadError({ type: '/problems/other' });

      expect(handled).toBe(false);
      expect(toastr.e).toHaveBeenCalledTimes(1);
      expect(toastr.e).toHaveBeenCalledWith('message.table_load_error');
      expect(localStorageSnapshot()).toEqual({ ProjectsSortName: 'name' });
    });

    it('shows no toast at all when the fallback is disabled', () => {
      const handled = handleTableLoadError(
        { type: '/problems/other' },
        { fallback: false },
      );

      expect(handled).toBe(false);
      expect(toastr.e).not.toHaveBeenCalled();
      expect(toastr.w).not.toHaveBeenCalled();
    });

    it('falls back when there is no problem at all', () => {
      expect(handleTableLoadError(undefined)).toBe(false);
      expect(toastr.e).toHaveBeenCalledTimes(1);
    });

    it('falls back when the problem type matches but carries no field', () => {
      expect(
        handleTableLoadError({ type: INVALID_SORT_FIELD_PROBLEM_TYPE }),
      ).toBe(false);
      expect(toastr.e).toHaveBeenCalledTimes(1);
    });
  });
});
