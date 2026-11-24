import { createSSRApp, h } from 'vue';
import { createI18n } from 'vue-i18n';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it, vi } from 'vitest';
import en from '@/i18n/locales/en.json';
import DependencyGraphSearch from './DependencyGraphSearch.vue';
import { summarizeFindingsByComponent } from './dependencyGraph';

vi.mock('./dependencyGraph', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // SSR renders a single pass before user input; match against a seed query to exercise the option slot.
    searchNodes: (nodes, query) =>
      actual.searchNodes(nodes, query || 'com.example'),
  };
});

vi.mock('vue-multiselect', () => ({
  default: {
    name: 'Multiselect',
    props: ['options'],
    render() {
      return h(
        'ul',
        (this.options ?? []).map((option) =>
          h('li', { key: option.uuid }, this.$slots.option?.({ option })),
        ),
      );
    },
  },
}));

async function renderSearch(props) {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en },
  });
  const app = createSSRApp({
    render: () => h(DependencyGraphSearch, props),
  });
  app.use(i18n);
  app.directive('multiselect-label', {});
  return renderToString(app);
}

describe('DependencyGraphSearch vulnerability indicators', () => {
  it('renders severity badges for vulnerable components and omits them for clean components', async () => {
    const nodes = new Map([
      [
        'vuln-mixed',
        {
          uuid: 'vuln-mixed',
          type: 'COMPONENT',
          group: 'com.example',
          name: 'alpha-vuln',
          version: '1.0.0',
        },
      ],
      [
        'vuln-uniform',
        {
          uuid: 'vuln-uniform',
          type: 'COMPONENT',
          group: 'com.example',
          name: 'gamma-vuln',
          version: '1.5.0',
        },
      ],
      [
        'clean-1',
        {
          uuid: 'clean-1',
          type: 'COMPONENT',
          group: 'com.example',
          name: 'beta-clean',
          version: '2.0.0',
        },
      ],
    ]);
    const vulnerabilitiesByComponent = summarizeFindingsByComponent([
      {
        component: { uuid: 'vuln-mixed' },
        vulnerability: { uuid: 'v1', severity: 'CRITICAL' },
      },
      {
        component: { uuid: 'vuln-mixed' },
        vulnerability: { uuid: 'v2', severity: 'LOW' },
      },
      {
        component: { uuid: 'vuln-uniform' },
        vulnerability: { uuid: 'v3', severity: 'HIGH' },
      },
      {
        component: { uuid: 'vuln-uniform' },
        vulnerability: { uuid: 'v4', severity: 'HIGH' },
      },
    ]);

    const html = await renderSearch({
      nodes,
      searched: new Set(),
      vulnerabilitiesByComponent,
    });

    expect(html).toContain('alpha-vuln');
    expect(html).toContain('gamma-vuln');
    expect(html).toContain('beta-clean');
    expect(html).toContain('dependency-graph-search-vuln badge');
    expect(html).toContain('severity-critical-bg');
    expect(html).toContain('1 Critical (+1)');
    expect(html).not.toContain('2 Critical');
    expect(html).toContain('severity-high-bg');
    expect(html).toContain('2 High');
    // Visual badges are hidden from assistive technologies; full breakdown is exposed via visually-hidden text.
    expect(html.match(/dependency-graph-search-vuln/g)).toHaveLength(2);
    expect(
      html.match(/dependency-graph-search-vuln[^>]*(?:aria-hidden="true")/g),
    ).toHaveLength(2);
    expect(html).toContain(
      '<span class="visually-hidden">, 2 vulnerabilities (1 Critical, 1 Low)</span>',
    );
    expect(html).toContain(
      '<span class="visually-hidden">, 2 vulnerabilities (2 High)</span>',
    );
  });

  it('renders cleanly when vulnerability data is missing or empty', async () => {
    const nodes = new Map([
      [
        'clean-1',
        {
          uuid: 'clean-1',
          type: 'COMPONENT',
          group: 'com.example',
          name: 'beta-clean',
          version: '2.0.0',
        },
      ],
    ]);

    const html = await renderSearch({
      nodes,
      searched: new Set(),
    });

    expect(html).toContain('beta-clean');
    expect(html).not.toContain('dependency-graph-search-vuln');
  });
});
