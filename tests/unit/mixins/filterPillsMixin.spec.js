import jQuery from 'jquery';
import { mount } from '@vue/test-utils';
import filterPillsMixin from '@/mixins/filterPillsMixin';

// The mixin reads allFilterDefs, booleanFilters, `<name>Filter`, refreshTable
// and $refs from the consuming component, so the host below doubles as
// executable documentation of that contract.
//
// allFilterDefs has to be reactive data rather than a computed on a stub,
// because created() iterates it to register the watchers.
const TOOLBAR_TEMPLATE =
  '<div class="fixed-table-toolbar">' +
  '<div class="columns">' +
  '<button class="btn" title="Refresh" name="refresh"></button>' +
  '<button class="btn" aria-label="Already labelled"></button>' +
  '<button class="btn">Columns</button>' +
  '</div>' +
  '<div class="filter-bar"></div>' +
  '</div>';

describe('mixins/filterPillsMixin', () => {
  // Vue binds methods to the instance, so the copy reachable through `vm` is
  // not the mock itself and cannot be asserted on directly.
  let refreshTable;

  const createHost = (overrides = {}) => {
    refreshTable = jest.fn();
    return mount({
      mixins: [filterPillsMixin],
      data() {
        return {
          allFilterDefs: [
            { name: 'name', label: 'Name' },
            { name: 'tags', label: 'Tags' },
            { name: 'onlyOutdated', label: 'Outdated' },
          ],
          booleanFilters: ['onlyOutdated'],
          nameFilter: '',
          tagsFilter: [],
          onlyOutdated: false,
        };
      },
      methods: { refreshTable },
      template: TOOLBAR_TEMPLATE,
      ...overrides,
    });
  };

  describe('hasFilterValue', () => {
    it('reads a boolean filter directly off the component', () => {
      const wrapper = createHost();

      expect(wrapper.vm.hasFilterValue('onlyOutdated')).toBe(false);

      wrapper.vm.onlyOutdated = true;

      expect(wrapper.vm.hasFilterValue('onlyOutdated')).toBe(true);
    });

    it('reads a non-boolean filter from the Filter-suffixed property', () => {
      const wrapper = createHost();
      wrapper.vm.nameFilter = 'acme';

      expect(wrapper.vm.hasFilterValue('name')).toBe(true);
    });

    it('treats an empty array as no value', () => {
      expect(createHost().vm.hasFilterValue('tags')).toBe(false);
    });

    it('treats a non-empty array as a value', () => {
      const wrapper = createHost();
      wrapper.vm.tagsFilter = ['prod'];

      expect(wrapper.vm.hasFilterValue('tags')).toBe(true);
    });

    it('treats an empty string as no value', () => {
      expect(createHost().vm.hasFilterValue('name')).toBe(false);
    });
  });

  describe('activeFilterCount', () => {
    it('is zero when no filter carries a value', () => {
      expect(createHost().vm.activeFilterCount).toBe(0);
    });

    it('counts only the filters that carry a value', async () => {
      const wrapper = createHost();

      await wrapper.setData({ nameFilter: 'acme', onlyOutdated: true });

      expect(wrapper.vm.activeFilterCount).toBe(2);
    });
  });

  describe('addFilterOptions', () => {
    it('offers every filter while none is visible', () => {
      expect(createHost().vm.addFilterOptions).toHaveLength(3);
    });

    it('excludes filters that already carry a value', async () => {
      const wrapper = createHost();

      await wrapper.setData({ nameFilter: 'acme' });

      expect(wrapper.vm.addFilterOptions.map((def) => def.name)).toEqual([
        'tags',
        'onlyOutdated',
      ]);
    });

    it('excludes filters that are pending', async () => {
      const wrapper = createHost();

      wrapper.vm.showFilter('tags');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.addFilterOptions.map((def) => def.name)).toEqual([
        'name',
        'onlyOutdated',
      ]);
    });
  });

  describe('the filter watchers', () => {
    it('clears the pending flag and refreshes when a filter gains a value', async () => {
      const wrapper = createHost();
      wrapper.vm.showFilter('name');
      await wrapper.vm.$nextTick();

      await wrapper.setData({ nameFilter: 'acme' });

      expect(wrapper.vm.pendingFilters.name).toBe(false);
      expect(refreshTable).toHaveBeenCalled();
    });

    it('refreshes without touching the pending flag when a filter is cleared', async () => {
      const wrapper = createHost();
      await wrapper.setData({ nameFilter: 'acme' });
      refreshTable.mockClear();

      await wrapper.setData({ nameFilter: '' });

      expect(wrapper.vm.pendingFilters.name).toBe(false);
      expect(refreshTable).toHaveBeenCalledTimes(1);
    });

    it('never records a pending flag for a boolean filter', async () => {
      const wrapper = createHost();

      await wrapper.setData({ onlyOutdated: true });

      expect(wrapper.vm.pendingFilters.onlyOutdated).toBeUndefined();
      expect(refreshTable).toHaveBeenCalled();
    });

    it('suppresses the refresh while the component is clearing', async () => {
      const wrapper = createHost();
      wrapper.vm._clearing = true;

      await wrapper.setData({ nameFilter: 'acme' });

      expect(refreshTable).not.toHaveBeenCalled();
    });

    it('does not throw when the host has no refreshTable method', async () => {
      const wrapper = createHost({ methods: {} });

      await expect(
        wrapper.setData({ nameFilter: 'acme' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('showFilter', () => {
    it('sets a boolean filter instead of marking it pending', () => {
      const wrapper = createHost();

      wrapper.vm.showFilter('onlyOutdated');

      expect(wrapper.vm.onlyOutdated).toBe(true);
      expect(wrapper.vm.pendingFilters.onlyOutdated).toBeUndefined();
    });

    it('marks a non-boolean filter pending and opens its pill', async () => {
      const open = jest.fn();
      const wrapper = createHost();
      wrapper.vm.$refs.filter_name = { open };

      wrapper.vm.showFilter('name');

      expect(wrapper.vm.pendingFilters.name).toBe(true);

      // The pill is opened after two nested ticks.
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(open).toHaveBeenCalled();
    });

    it('does not throw when the pill ref is missing', async () => {
      const wrapper = createHost();

      wrapper.vm.showFilter('name');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.pendingFilters.name).toBe(true);
    });

    it('does not throw when the pill ref cannot be opened', async () => {
      const wrapper = createHost();
      wrapper.vm.$refs.filter_name = {};

      wrapper.vm.showFilter('name');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.pendingFilters.name).toBe(true);
    });
  });

  describe('isFilterVisible', () => {
    it('is true while the filter is pending', async () => {
      const wrapper = createHost();

      wrapper.vm.showFilter('name');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isFilterVisible('name')).toBe(true);
    });

    it('is true while the filter carries a value', async () => {
      const wrapper = createHost();

      await wrapper.setData({ nameFilter: 'acme' });

      expect(wrapper.vm.isFilterVisible('name')).toBe(true);
    });

    it('is false for an untouched filter', () => {
      expect(createHost().vm.isFilterVisible('name')).toBe(false);
    });
  });

  describe('onFilterDismiss', () => {
    it('drops the pending flag', async () => {
      const wrapper = createHost();
      wrapper.vm.showFilter('name');
      await wrapper.vm.$nextTick();

      wrapper.vm.onFilterDismiss('name');

      expect(wrapper.vm.pendingFilters.name).toBe(false);
    });
  });

  describe('clearPendingFilters', () => {
    it('resets the known flags without introducing new ones', async () => {
      const wrapper = createHost();
      wrapper.vm.showFilter('name');
      wrapper.vm.showFilter('tags');
      await wrapper.vm.$nextTick();

      wrapper.vm.clearPendingFilters();

      expect(wrapper.vm.pendingFilters).toEqual({ name: false, tags: false });
    });
  });

  // The adoption runs inside the $nextTick registered by mounted(), so every
  // assertion below has to let that tick fire first.
  describe('adopting the bootstrap-table toolbar controls', () => {
    const createMountedHost = async (overrides) => {
      const wrapper = createHost(overrides);
      await wrapper.vm.$nextTick();
      return wrapper;
    };

    it('moves the column controls into the filter bar', async () => {
      const wrapper = await createMountedHost();

      const columns = wrapper.element.querySelector('.filter-bar > .columns');
      expect(columns).not.toBeNull();
      expect(columns.style.marginLeft).toBe('auto');
      expect(columns.style.flexShrink).toBe('0');
    });

    it('labels an icon-only button from its title', async () => {
      const wrapper = await createMountedHost();

      const button = wrapper.element.querySelector('.btn[name="refresh"]');
      expect(button.getAttribute('aria-label')).toBe('Refresh');
    });

    it('leaves a button that already carries a label alone', async () => {
      const wrapper = await createMountedHost();

      const buttons = wrapper.element.querySelectorAll('.filter-bar .btn');
      expect(buttons[1].getAttribute('aria-label')).toBe('Already labelled');
    });

    it('leaves a button that already carries text alone', async () => {
      const wrapper = await createMountedHost();

      const buttons = wrapper.element.querySelectorAll('.filter-bar .btn');
      expect(buttons[2].getAttribute('aria-label')).toBeNull();
    });

    it('does nothing when there is no filter bar', async () => {
      const wrapper = await createMountedHost({
        template: '<div><span class="other"></span></div>',
      });

      expect(wrapper.element.querySelector('.columns')).toBeNull();
    });

    it('does nothing when the filter bar is outside a table toolbar', async () => {
      const wrapper = await createMountedHost({
        template: '<div><div class="filter-bar"></div></div>',
      });

      expect(
        wrapper.element.querySelector('.filter-bar > .columns'),
      ).toBeNull();
    });
  });

  describe('the bootstrap-table event binding', () => {
    const TABLE_TEMPLATE =
      '<div class="fixed-table-toolbar">' +
      '<div class="columns"></div>' +
      '<div class="filter-bar"></div>' +
      '<table></table>' +
      '</div>';

    it('re-runs the adoption when the table redraws its body', async () => {
      const wrapper = createHost({ template: TABLE_TEMPLATE });
      await wrapper.vm.$nextTick();

      // Put the controls back where bootstrap-table would have recreated them.
      const toolbar = wrapper.element;
      toolbar.insertBefore(
        toolbar.querySelector('.columns'),
        toolbar.firstChild,
      );
      expect(toolbar.querySelector('.filter-bar > .columns')).toBeNull();

      jQuery(toolbar.querySelector('table')).trigger('post-body.bs.table');

      expect(toolbar.querySelector('.filter-bar > .columns')).not.toBeNull();
    });

    it('unbinds the handler when the component is destroyed', async () => {
      const wrapper = createHost({ template: TABLE_TEMPLATE });
      await wrapper.vm.$nextTick();
      const table = wrapper.element.querySelector('table');

      wrapper.destroy();
      const handlers = jQuery._data(table, 'events');

      expect(handlers).toBeUndefined();
    });

    it('does not bind anything when the host renders no table', async () => {
      const wrapper = createHost();
      await wrapper.vm.$nextTick();

      expect(() => wrapper.destroy()).not.toThrow();
    });
  });

  describe('_queryEl', () => {
    it('returns null when the root element cannot be queried', () => {
      const wrapper = createHost();
      wrapper.vm.$el = {};

      expect(wrapper.vm._queryEl('.filter-bar')).toBeNull();
    });
  });
});
