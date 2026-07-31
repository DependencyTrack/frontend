import { mount, createLocalVue } from '@vue/test-utils';
import filterPillsMixin from '@/mixins/filterPillsMixin';

// The mixin's URL sync is driven entirely by allFilterDefs / booleanFilters, so
// a bare host component exercising the real code path is enough. jQuery table
// adoption is a no-op here because the component renders no bootstrap-table.
const SEVERITY_OPTIONS = [
  { text: 'Critical', value: 'critical' },
  { text: 'High', value: 'high' },
  { text: 'Low', value: 'low' },
];

const TEXT_SEARCH_FIELDS = [
  { text: 'Vulnerability', value: 'vulnerability_id' },
  { text: 'Component', value: 'component_name' },
  { text: 'Project', value: 'project_name' },
];

function buildHost({
  query = {},
  filterUrlSync = true,
  replace = jest.fn(() => Promise.resolve()),
} = {}) {
  const route = { path: '/vulnerabilityAudit/', query };

  const localVue = createLocalVue();

  const wrapper = mount(
    {
      mixins: [filterPillsMixin],
      data() {
        return {
          filterUrlSync,
          booleanFilters: ['showInactive', 'showKevOnly'],
          showInactive: false,
          showKevOnly: false,
          severityFilter: [],
          textSearchFilter: null,
          publishDateFilter: null,
          cvssv3Filter: null,
          // Stands in for the bootstrap-table options object the real views
          // build in data(); the mixin rewrites `url` when hydrating.
          options: { url: '/api/v1/finding' },
          apiUrlCalls: 0,
        };
      },
      computed: {
        allFilterDefs() {
          return [
            {
              name: 'severity',
              label: 'Severity',
              type: 'multiselect',
              options: SEVERITY_OPTIONS,
            },
            {
              name: 'textSearch',
              label: 'Search',
              type: 'text',
              fields: TEXT_SEARCH_FIELDS,
            },
            { name: 'publishDate', label: 'Published', type: 'daterange' },
            {
              name: 'cvssv3',
              label: 'CVSSv3',
              type: 'numrange',
              min: 0,
              max: 10,
            },
            { name: 'showInactive', label: 'Show inactive' },
            { name: 'showKevOnly', label: 'KEV' },
          ];
        },
      },
      methods: {
        apiUrl() {
          this.apiUrlCalls += 1;
          return '/api/v1/finding?built=true';
        },
        refreshTable: jest.fn(),
      },
      render(h) {
        return h('div', [h('div', { class: 'filter-bar' })]);
      },
    },
    {
      localVue,
      mocks: {
        $route: route,
        $router: { replace },
      },
    },
  );

  return { wrapper, replace, route };
}

// Vue watchers run on a microtask, and only then does the mixin schedule its
// debounced URL write. So flush watchers first, then advance past the debounce,
// then flush again to settle the router promise.
async function flushQuerySync(wrapper) {
  await wrapper.vm.$nextTick();
  jest.advanceTimersByTime(300);
  await wrapper.vm.$nextTick();
}

describe('filterPillsMixin URL query synchronisation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('encoding filter state into query parameters', () => {
    it('writes a multi-select filter as a comma separated list', async () => {
      const { wrapper, replace } = buildHost();

      wrapper.vm.severityFilter = ['critical', 'high'];
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenCalledWith({
        path: '/vulnerabilityAudit/',
        query: { severity: 'critical,high' },
      });
    });

    it('writes a boolean filter only while it is enabled', async () => {
      const { wrapper, replace } = buildHost();

      wrapper.vm.showKevOnly = true;
      await flushQuerySync(wrapper);
      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({ query: { showKevOnly: 'true' } }),
      );

      // Simulate the router having applied the previous write.
      wrapper.vm.$route.query = { showKevOnly: 'true' };
      wrapper.vm.showKevOnly = false;
      await flushQuerySync(wrapper);
      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({ query: {} }),
      );
    });

    it('writes a text search as its term plus the selected fields', async () => {
      const { wrapper, replace } = buildHost();

      wrapper.vm.textSearchFilter = {
        fields: ['vulnerability_id', 'component_name'],
        value: 'log4j',
      };
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: {
            textSearch: 'log4j',
            textSearchFields: 'vulnerability_id,component_name',
          },
        }),
      );
    });

    it('writes range filters as From/To pairs', async () => {
      const { wrapper, replace } = buildHost();

      wrapper.vm.publishDateFilter = {
        since: '2024-01-01',
        before: '2024-12-31',
      };
      wrapper.vm.cvssv3Filter = { from: 7, to: 9.5 };
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: {
            publishDateFrom: '2024-01-01',
            publishDateTo: '2024-12-31',
            cvssv3From: 7,
            cvssv3To: 9.5,
          },
        }),
      );
    });

    it('omits the unset half of a partially bounded range', async () => {
      const { wrapper, replace } = buildHost();

      wrapper.vm.cvssv3Filter = { from: 7, to: null };
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({ query: { cvssv3From: 7 } }),
      );
    });

    it('preserves query parameters it does not own', async () => {
      const { wrapper, replace } = buildHost({
        query: { unrelated: 'keep-me' },
      });

      wrapper.vm.severityFilter = ['low'];
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: { unrelated: 'keep-me', severity: 'low' },
        }),
      );
    });

    it('coalesces a bulk clear into a single navigation', async () => {
      const { wrapper, replace } = buildHost({
        query: { severity: 'critical', showKevOnly: 'true' },
      });

      wrapper.vm.severityFilter = ['critical'];
      wrapper.vm.showKevOnly = true;
      await flushQuerySync(wrapper);
      replace.mockClear();

      wrapper.vm.severityFilter = [];
      wrapper.vm.showKevOnly = false;
      wrapper.vm.cvssv3Filter = null;
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenLastCalledWith(
        expect.objectContaining({ query: {} }),
      );
    });

    it('does not navigate when the query would be unchanged', async () => {
      const { wrapper, replace } = buildHost({ query: { severity: 'low' } });

      // Hydration already produced exactly this state.
      wrapper.vm.severityFilter = ['low'];
      await flushQuerySync(wrapper);

      expect(replace).not.toHaveBeenCalled();
    });

    it('stays out of the URL entirely when sync is not enabled', async () => {
      const { wrapper, replace } = buildHost({ filterUrlSync: false });

      wrapper.vm.severityFilter = ['critical'];
      await flushQuerySync(wrapper);

      expect(replace).not.toHaveBeenCalled();
    });
  });

  describe('decoding query parameters into filter state', () => {
    it('restores every filter type from a bookmarked URL', () => {
      const { wrapper } = buildHost({
        query: {
          severity: 'critical,high',
          textSearch: 'log4j',
          textSearchFields: 'vulnerability_id,project_name',
          publishDateFrom: '2024-01-01',
          publishDateTo: '2024-12-31',
          cvssv3From: '7',
          cvssv3To: '9.5',
          showKevOnly: 'true',
        },
      });

      expect(wrapper.vm.severityFilter).toEqual(['critical', 'high']);
      expect(wrapper.vm.textSearchFilter).toEqual({
        fields: ['vulnerability_id', 'project_name'],
        value: 'log4j',
      });
      expect(wrapper.vm.publishDateFilter).toEqual({
        since: '2024-01-01',
        before: '2024-12-31',
      });
      expect(wrapper.vm.cvssv3Filter).toEqual({ from: 7, to: 9.5 });
      expect(wrapper.vm.showKevOnly).toBe(true);
      expect(wrapper.vm.showInactive).toBe(false);
    });

    it('makes restored filters visible as pills', () => {
      const { wrapper } = buildHost({ query: { severity: 'critical' } });

      expect(wrapper.vm.isFilterVisible('severity')).toBe(true);
      expect(wrapper.vm.isFilterVisible('cvssv3')).toBe(false);
      expect(wrapper.vm.activeFilterCount).toBe(1);
    });

    it('rebuilds the table URL so a bookmark loads in one request', () => {
      const { wrapper } = buildHost({ query: { severity: 'critical' } });

      expect(wrapper.vm.options.url).toBe('/api/v1/finding?built=true');
      expect(wrapper.vm.apiUrlCalls).toBe(1);
    });

    it('leaves the table URL alone when no filter was restored', () => {
      const { wrapper } = buildHost();

      expect(wrapper.vm.options.url).toBe('/api/v1/finding');
      expect(wrapper.vm.apiUrlCalls).toBe(0);
    });

    it('round-trips state through encode and decode unchanged', async () => {
      const { wrapper, replace } = buildHost();

      wrapper.vm.severityFilter = ['critical', 'low'];
      wrapper.vm.cvssv3Filter = { from: 1.5, to: 8 };
      wrapper.vm.showInactive = true;
      await flushQuerySync(wrapper);

      const written =
        replace.mock.calls[replace.mock.calls.length - 1][0].query;
      const { wrapper: restored } = buildHost({ query: written });

      expect(restored.vm.severityFilter).toEqual(['critical', 'low']);
      expect(restored.vm.cvssv3Filter).toEqual({ from: 1.5, to: 8 });
      expect(restored.vm.showInactive).toBe(true);
    });
  });

  describe('rejecting untrusted query values', () => {
    it('drops multi-select values that are not offered as options', () => {
      const { wrapper } = buildHost({
        query: { severity: 'critical,bogus,<script>' },
      });

      expect(wrapper.vm.severityFilter).toEqual(['critical']);
    });

    it('leaves a multi-select unset when no value survives validation', () => {
      const { wrapper } = buildHost({ query: { severity: 'nonsense' } });

      expect(wrapper.vm.severityFilter).toEqual([]);
    });

    it('clamps numeric bounds into the filter range', () => {
      const { wrapper } = buildHost({
        query: { cvssv3From: '-5', cvssv3To: '99' },
      });

      expect(wrapper.vm.cvssv3Filter).toEqual({ from: 0, to: 10 });
    });

    it('discards non-numeric bounds', () => {
      const { wrapper } = buildHost({
        query: { cvssv3From: 'abc', cvssv3To: 'NaN' },
      });

      expect(wrapper.vm.cvssv3Filter).toBeNull();
    });

    it('discards malformed dates', () => {
      const { wrapper } = buildHost({
        query: { publishDateFrom: 'not-a-date', publishDateTo: '2024-13-99x' },
      });

      expect(wrapper.vm.publishDateFilter).toBeNull();
    });

    it('accepts epoch millis as a date boundary', () => {
      const { wrapper } = buildHost({
        query: { publishDateFrom: '1704067200000' },
      });

      expect(wrapper.vm.publishDateFilter).toEqual({
        since: 1704067200000,
        before: null,
      });
    });

    it('treats any boolean value other than true as off', () => {
      expect(
        buildHost({ query: { showKevOnly: 'maybe' } }).wrapper.vm.showKevOnly,
      ).toBe(false);
      expect(
        buildHost({ query: { showKevOnly: 'false' } }).wrapper.vm.showKevOnly,
      ).toBe(false);
      expect(
        buildHost({ query: { showKevOnly: '1' } }).wrapper.vm.showKevOnly,
      ).toBe(false);
      expect(
        buildHost({ query: { showKevOnly: 'TRUE' } }).wrapper.vm.showKevOnly,
      ).toBe(true);
    });

    it('falls back to all fields when the text search fields are unusable', () => {
      const { wrapper } = buildHost({
        query: { textSearch: 'log4j', textSearchFields: 'nonsense' },
      });

      expect(wrapper.vm.textSearchFilter).toEqual({
        fields: ['vulnerability_id', 'component_name', 'project_name'],
        value: 'log4j',
      });
    });

    it('ignores a text search with no term', () => {
      const { wrapper } = buildHost({
        query: { textSearch: '   ', textSearchFields: 'vulnerability_id' },
      });

      expect(wrapper.vm.textSearchFilter).toBeNull();
    });

    it('ignores parameters whose value is not a usable scalar', () => {
      const { wrapper } = buildHost({
        query: {
          severity: { nested: 'object' },
          cvssv3From: '',
          cvssv3To: null,
        },
      });

      expect(wrapper.vm.severityFilter).toEqual([]);
      expect(wrapper.vm.cvssv3Filter).toBeNull();
    });

    // The mixin writes query objects in memory, so a value can still be a
    // number or boolean rather than the string a URL would have produced.
    it('accepts non-string scalars in a programmatically built query', () => {
      const { wrapper } = buildHost({
        query: { cvssv3From: 7, cvssv3To: 9.5, showKevOnly: true },
      });

      expect(wrapper.vm.cvssv3Filter).toEqual({ from: 7, to: 9.5 });
      expect(wrapper.vm.showKevOnly).toBe(true);
    });

    it('takes the last occurrence of a repeated parameter', () => {
      const { wrapper } = buildHost({
        query: { severity: ['critical', 'low'] },
      });

      expect(wrapper.vm.severityFilter).toEqual(['low']);
    });
  });

  describe('reacting to navigation', () => {
    it('adopts filters from an externally changed URL', async () => {
      const { wrapper } = buildHost({ query: { severity: 'critical' } });

      wrapper.vm.$route.query = { severity: 'low', showKevOnly: 'true' };
      wrapper.vm.$emit('hook:updated');
      // Trigger the mixin's own $route watcher.
      wrapper.vm.$options.watch.$route.call(wrapper.vm);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.severityFilter).toEqual(['low']);
      expect(wrapper.vm.showKevOnly).toBe(true);
    });

    it('resets filters the incoming URL no longer mentions', async () => {
      const { wrapper } = buildHost({
        query: { severity: 'critical', showKevOnly: 'true' },
      });

      wrapper.vm.$route.query = {};
      wrapper.vm.$options.watch.$route.call(wrapper.vm);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.severityFilter).toEqual([]);
      expect(wrapper.vm.showKevOnly).toBe(false);
    });

    it('does not adopt URL changes when sync is not enabled', async () => {
      const { wrapper } = buildHost({ filterUrlSync: false });

      wrapper.vm.$route.query = { severity: 'low' };
      wrapper.vm.$options.watch.$route.call(wrapper.vm);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.severityFilter).toEqual([]);
    });

    // A rejected navigation must clear the self-navigation flag, otherwise the
    // mixin would mistake the next genuine URL change for its own echo and
    // silently ignore it.
    it('recovers from a rejected navigation', async () => {
      const replace = jest.fn(() => Promise.reject(new Error('redundant')));
      const { wrapper } = buildHost({ replace });

      wrapper.vm.severityFilter = ['critical'];
      await flushQuerySync(wrapper);
      await wrapper.vm.$nextTick();

      expect(replace).toHaveBeenCalled();

      wrapper.vm.$route.query = { severity: 'low' };
      wrapper.vm.$options.watch.$route.call(wrapper.vm);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.severityFilter).toEqual(['low']);
    });

    it('ignores the echo of its own write', async () => {
      const { wrapper } = buildHost();

      wrapper.vm.severityFilter = ['critical'];
      await flushQuerySync(wrapper);

      // The router now reports the URL the mixin just wrote. Re-applying it
      // must not clobber state the user changed in the meantime.
      wrapper.vm.$route.query = { severity: 'critical' };
      wrapper.vm.severityFilter = ['low'];
      wrapper.vm.$options.watch.$route.call(wrapper.vm);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.severityFilter).toEqual(['low']);
    });
  });

  describe('tabbed views sharing one query string', () => {
    it('does not write the URL while its tab pane is hidden', async () => {
      const { wrapper, replace } = buildHost();

      const pane = document.createElement('div');
      pane.className = 'tab-pane';
      pane.appendChild(wrapper.vm.$el);

      wrapper.vm.severityFilter = ['critical'];
      await flushQuerySync(wrapper);

      expect(replace).not.toHaveBeenCalled();
    });

    it('does not adopt a URL change meant for the other tab', async () => {
      const { wrapper } = buildHost({ query: { severity: 'critical' } });

      const pane = document.createElement('div');
      pane.className = 'tab-pane';
      pane.appendChild(wrapper.vm.$el);

      wrapper.vm.$route.query = { severity: 'low' };
      wrapper.vm.$options.watch.$route.call(wrapper.vm);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.severityFilter).toEqual(['critical']);
    });

    it('treats a component with no element as not showing', () => {
      const { wrapper } = buildHost();
      const originalEl = wrapper.vm.$el;

      // Vue substitutes a comment placeholder for $el when a render fails.
      Object.defineProperty(wrapper.vm, '$el', {
        value: document.createComment('placeholder'),
        configurable: true,
      });
      expect(wrapper.vm.isActiveFilterView()).toBe(false);

      Object.defineProperty(wrapper.vm, '$el', {
        value: originalEl,
        configurable: true,
      });
    });

    it('writes the URL once its tab pane is showing', async () => {
      const { wrapper, replace } = buildHost();

      const pane = document.createElement('div');
      pane.className = 'tab-pane active';
      pane.appendChild(wrapper.vm.$el);

      wrapper.vm.severityFilter = ['critical'];
      await flushQuerySync(wrapper);

      expect(replace).toHaveBeenCalledWith(
        expect.objectContaining({ query: { severity: 'critical' } }),
      );
    });
  });
});
