import { createSSRApp, h } from 'vue';
import { createI18n } from 'vue-i18n';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import de from '@/i18n/locales/de.json';
import ptBR from '@/i18n/locales/pt-BR.json';
import DependencyGraphNode from './DependencyGraphNode.vue';
import { summarizeFindingsByComponent } from './dependencyGraph';

const RouterLinkStub = {
  props: ['to'],
  render() {
    return h('a', { href: this.to }, this.$slots.default?.());
  },
};

async function renderNode(props, locale = 'en') {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { en, de, 'pt-BR': ptBR },
  });
  const app = createSSRApp({
    render: () => h(DependencyGraphNode, props),
  });
  app.use(i18n);
  app.component('RouterLink', RouterLinkStub);
  return renderToString(app);
}

describe('DependencyGraphNode vulnerability highlighting', () => {
  const componentNode = {
    uuid: 'comp-1',
    type: 'COMPONENT',
    group: 'com.example',
    name: 'demo-lib',
    version: '1.2.3',
    direct_dependencies: ['child-1', 'child-2'],
  };

  it('keeps non-vulnerable component nodes unchanged', async () => {
    const html = await renderNode({
      node: componentNode,
      visible: new Set(['comp-1']),
      direct: true,
    });

    expect(html).not.toContain('vulnerable');
    expect(html).not.toContain('dependency-graph-vuln');
    expect(html).not.toContain('fa-bug');
    expect(html).toContain(
      'aria-label="com.example/demo-lib 1.2.3, direct dependency"',
    );
    expect(html).toContain('href="/components/comp-1"');
  });

  it('highlights a single Critical vulnerability accurately', async () => {
    const vulnerabilities = summarizeFindingsByComponent([
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v1', severity: 'CRITICAL' },
      },
    ]).get('comp-1');

    const html = await renderNode({
      node: componentNode,
      visible: new Set(['comp-1']),
      vulnerabilities,
    });

    expect(html).toContain('dependency-graph-card');
    expect(html).toContain('vulnerable');
    expect(html).toContain('dependency-graph-severity-critical');
    expect(html).toContain('dependency-graph-vuln badge severity-critical-bg');
    expect(html).toContain('dependency-graph-vuln-icon fa fa-bug');
    expect(html).toContain(
      '<span class="dependency-graph-vuln-text text-truncate">1 Critical</span>',
    );
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(
      'aria-label="com.example/demo-lib 1.2.3, 1 vulnerability (1 Critical)"',
    );
    expect(html).toContain(
      'title="com.example/demo-lib 1.2.3, 1 vulnerability (1 Critical)"',
    );
  });

  it('shows exact count when all vulnerabilities share the same severity (three Critical)', async () => {
    const vulnerabilities = summarizeFindingsByComponent([
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v1', severity: 'CRITICAL' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v2', severity: 'CRITICAL' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v3', severity: 'CRITICAL' },
      },
    ]).get('comp-1');

    const html = await renderNode({
      node: componentNode,
      visible: new Set(['comp-1']),
      vulnerabilities,
    });

    expect(html).toContain(
      '<span class="dependency-graph-vuln-text text-truncate">3 Critical</span>',
    );
    expect(html).not.toContain('(+');
    expect(html).toContain(
      'aria-label="com.example/demo-lib 1.2.3, 3 vulnerabilities (3 Critical)"',
    );
  });

  it('disambiguates mixed Critical, Medium, and Unassigned vulnerabilities', async () => {
    const vulnerabilities = summarizeFindingsByComponent([
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v1', severity: 'MEDIUM' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v2', severity: 'CRITICAL' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v3', severity: null },
      },
    ]).get('comp-1');

    const html = await renderNode({
      node: componentNode,
      visible: new Set(['comp-1']),
      direct: true,
      searched: true,
      expandable: true,
      vulnerabilities,
    });

    expect(html).toContain('searched');
    expect(html).toContain('direct');
    expect(html).toContain('vulnerable');
    expect(html).toContain('dependency-graph-severity-critical');
    expect(html).toContain('severity-critical-bg');
    expect(html).toContain(
      '<span class="dependency-graph-vuln-text text-truncate">1 Critical (+2)</span>',
    );
    expect(html).not.toContain('>3 Critical<');
    expect(html).toContain(
      'aria-label="com.example/demo-lib 1.2.3, direct dependency, 3 vulnerabilities (1 Critical, 1 Medium, 1 Unassigned)"',
    );
    // Existing expansion toggle and focus controls remain intact.
    expect(html).toContain('+2');
    expect(html).toContain('Show paths to this component');
  });

  it('disambiguates multiple findings at the highest severity plus additional lower severities', async () => {
    const vulnerabilities = summarizeFindingsByComponent([
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v1', severity: 'HIGH' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v2', severity: 'HIGH' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v3', severity: 'LOW' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v4', severity: 'INFO' },
      },
    ]).get('comp-1');

    const html = await renderNode({
      node: componentNode,
      visible: new Set(['comp-1']),
      vulnerabilities,
    });

    expect(html).toContain('dependency-graph-severity-high');
    expect(html).toContain(
      '<span class="dependency-graph-vuln-text text-truncate">2 High (+2)</span>',
    );
    expect(html).toContain(
      'aria-label="com.example/demo-lib 1.2.3, 4 vulnerabilities (2 High, 1 Low, 1 Info)"',
    );
  });

  it('never marks a project root node as vulnerable', async () => {
    const vulnerabilities = summarizeFindingsByComponent([
      {
        component: { uuid: 'proj-1' },
        vulnerability: { uuid: 'v1', severity: 'CRITICAL' },
      },
    ]).get('proj-1');

    const html = await renderNode({
      node: {
        uuid: 'proj-1',
        type: 'PROJECT',
        name: 'demo-app',
        version: '1.0.0',
        direct_dependencies: [],
      },
      visible: new Set(['proj-1']),
      vulnerabilities,
    });

    expect(html).toContain('project');
    expect(html).not.toContain('vulnerable');
    expect(html).not.toContain('dependency-graph-vuln');
  });

  it('safely normalizes missing or unknown severity values to unassigned', async () => {
    const html = await renderNode({
      node: componentNode,
      visible: new Set(['comp-1']),
      vulnerabilities: {
        total: 1,
        highestSeverity: 'UNKNOWN',
        counts: { UNASSIGNED: 1 },
      },
    });

    expect(html).toContain('dependency-graph-severity-unassigned');
    expect(html).toContain('severity-unassigned-bg');
    expect(html).toContain(
      '<span class="dependency-graph-vuln-text text-truncate">1 Unassigned</span>',
    );
  });

  it('wraps long localized severity labels in a truncatable inner span while keeping the bug icon', async () => {
    const vulnerabilities = summarizeFindingsByComponent([
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v1', severity: null },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v2', severity: null },
      },
    ]).get('comp-1');

    const germanHtml = await renderNode(
      {
        node: componentNode,
        visible: new Set(['comp-1']),
        vulnerabilities,
      },
      'de',
    );
    expect(germanHtml).toContain('dependency-graph-vuln-icon fa fa-bug');
    expect(germanHtml).toContain(
      `<span class="dependency-graph-vuln-text text-truncate">2 ${de.severity.unassigned}</span>`,
    );

    const portugueseHtml = await renderNode(
      {
        node: componentNode,
        visible: new Set(['comp-1']),
        vulnerabilities,
      },
      'pt-BR',
    );
    expect(portugueseHtml).toContain('dependency-graph-vuln-icon fa fa-bug');
    expect(portugueseHtml).toContain(
      `<span class="dependency-graph-vuln-text text-truncate">2 ${ptBR.severity.unassigned}</span>`,
    );
  });
});
