import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import common from './common';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/projects', name: 'Projects', component: {} },
    { path: '/vulnerabilities', name: 'Vulnerabilities', component: {} },
  ],
});

const SCRIPT_PAYLOAD = '<script>alert(1)</script>';
const ATTRIBUTE_BREAKOUT_PAYLOAD = '"><img src=x onerror=alert(1)>';
const TAG_PAYLOAD = '<img src=x onerror=alert(1)>';

// Markup that must never survive verbatim in element content.
function expectNoRawElementInjection(html) {
  expect(html).not.toContain('<script');
  expect(html).not.toContain('<img');
}

describe.each([
  ['formatProjectTagLabel', 'Projects', 'tag', 'text-bg-tag'],
  ['formatProjectTeamLabel', 'Projects', 'team', 'badge-team'],
  ['formatVulnerabilityTagLabel', 'Vulnerabilities', 'tag', 'text-bg-tag'],
])('%s', (formatterName, _route, queryKey, cssClass) => {
  const format = (name) => common[formatterName](router, { name });
  const hrefPrefix =
    formatterName === 'formatVulnerabilityTagLabel'
      ? '/vulnerabilities'
      : '/projects';

  it('renders a link with the name as text', () => {
    expect(format('production')).toBe(
      `<a href="${hrefPrefix}?${queryKey}=production" class="badge ${cssClass} text-lowercase me-1">production</a>`,
    );
  });

  it.each([undefined, null])('renders nothing for %s', (value) => {
    expect(common[formatterName](router, value)).toBe('');
  });

  it.each([
    ['script tag', SCRIPT_PAYLOAD],
    ['image tag', TAG_PAYLOAD],
    ['attribute breakout', ATTRIBUTE_BREAKOUT_PAYLOAD],
  ])('escapes markup in the name (%s)', (_description, payload) => {
    const html = format(payload);
    expectNoRawElementInjection(html);
    expect(html).toContain('&lt;');
  });

  it('keeps double quotes in the name from breaking out of the href attribute', () => {
    const html = format('x" onmouseover="alert(1)');
    const attributes = html.match(/^<a href="([^"]*)" class="([^"]*)">/);
    expect(attributes).not.toBeNull();
    expect(attributes[1]).toContain('%22');
  });
});

describe('formatViolationMessage', () => {
  it('renders the message as text and as tooltip', () => {
    expect(common.formatViolationMessage('Component is banned')).toBe(
      '<div class="truncate-ellipsis"><span title="Component is banned">Component is banned</span></div>',
    );
  });

  it.each([undefined, null, ''])('renders nothing for %j', (value) => {
    expect(common.formatViolationMessage(value)).toBe('');
  });

  it('escapes markup in the element content', () => {
    const html = common.formatViolationMessage(SCRIPT_PAYLOAD);
    expect(html).toContain('>&lt;script>alert(1)&lt;/script></span>');
  });

  it('keeps double quotes from breaking out of the title attribute', () => {
    const html = common.formatViolationMessage(ATTRIBUTE_BREAKOUT_PAYLOAD);
    const attributes = html.match(/<span title="([^"]*)">/);
    expect(attributes).not.toBeNull();
    expect(attributes[1]).toBe('&quot;><img src=x onerror=alert(1)>');
  });

  it('escapes the element injected after a quote breakout in the content', () => {
    const html = common.formatViolationMessage(ATTRIBUTE_BREAKOUT_PAYLOAD);
    expect(html).toContain('">&lt;img src=x onerror=alert(1)></span>');
  });
});

describe('formatAnalyzerLabel', () => {
  const link = (html) => html.match(/<a href="([^"]*)"/)?.[1];

  it('returns null without an analyzer', () => {
    expect(common.formatAnalyzerLabel(undefined, 'NVD', 'CVE-1')).toBeNull();
    expect(common.formatAnalyzerLabel('', 'NVD', 'CVE-1')).toBeNull();
  });

  it('renders an internal analyzer without a link when there is no URL', () => {
    const html = common.formatAnalyzerLabel('internal', 'INTERNAL', 'INT-1');
    expect(html).not.toContain('<a ');
    expect(html).toContain('label-analyzer-internal');
    expect(html).toContain('Internal');
  });

  it.each([
    ['GITHUB', 'GHSA-1', 'https://github.com/advisories/GHSA-1'],
    ['NVD', 'CVE-2024-1', 'https://nvd.nist.gov/vuln/detail/CVE-2024-1'],
    ['OSV', 'OSV-1', 'https://osv.dev/vulnerability/OSV-1'],
  ])('links a %s vulnerability to its advisory', (source, id, expectedUrl) => {
    const html = common.formatAnalyzerLabel('osv', source, id);
    expect(link(html)).toBe(expectedUrl);
    expect(html).toContain('target="_blank"');
  });

  it('prefers an explicit reference URL', () => {
    const html = common.formatAnalyzerLabel(
      'osv',
      'NVD',
      'CVE-1',
      'https://example.com/advisory?id=1',
    );
    expect(link(html)).toBe('https://example.com/advisory?id=1');
  });

  it('escapes markup in the analyzer label', () => {
    const html = common.formatAnalyzerLabel(SCRIPT_PAYLOAD, 'INTERNAL', 'x');
    expectNoRawElementInjection(html);
    expect(html).toContain('&lt;script>');
  });

  it('escapes markup in the analyzer label next to a link', () => {
    const html = common.formatAnalyzerLabel(
      SCRIPT_PAYLOAD,
      'NVD',
      'CVE-1',
      'https://example.com',
    );
    expectNoRawElementInjection(html);
    expect(html).toContain('&lt;script>');
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
  ])('neutralises the dangerous scheme in %s', (referenceUrl) => {
    const href = link(
      common.formatAnalyzerLabel('osv', 'NVD', 'x', referenceUrl),
    );
    expect(href).toMatch(/^x-/);
  });

  it.each([
    ['space', ' javascript:alert(1)', '%20javascript:alert(1)'],
    ['tab', '\tjavascript:alert(1)', '%09javascript:alert(1)'],
    ['newline', '\njavascript:alert(1)', '%0Ajavascript:alert(1)'],
    [
      'tab inside the scheme',
      'java\tscript:alert(1)',
      'java%09script:alert(1)',
    ],
  ])(
    'percent-encodes control characters so the scheme is not parsed (%s)',
    (_description, referenceUrl, expectedHref) => {
      const html = common.formatAnalyzerLabel('osv', 'NVD', 'x', referenceUrl);
      expect(link(html)).toBe(expectedHref);
    },
  );

  it('keeps quotes in the reference URL from breaking out of the href attribute', () => {
    const html = common.formatAnalyzerLabel(
      'osv',
      'NVD',
      'x',
      'https://example.com/"><img src=x onerror=alert(1)>',
    );
    expect(html).not.toContain('<img');
    expect(link(html)).toBe(
      'https://example.com/%22%3E%3Cimg%20src=x%20onerror=alert(1)%3E',
    );
  });

  it('keeps quotes in the vulnerability id from breaking out of the href attribute', () => {
    const html = common.formatAnalyzerLabel(
      'osv',
      'GITHUB',
      ATTRIBUTE_BREAKOUT_PAYLOAD,
    );
    expect(html).not.toContain('<img');
    expect(link(html)).toMatch(/^https:\/\/github\.com\/advisories\/%22%3E/);
  });
});

describe('getCollectionLogicText', () => {
  // Echo the interpolation values, as the real i18n would substitute them
  // into the message.
  const i18n = { $t: (key, values) => `${key}|${values?.tag ?? ''}` };

  it('interpolates the collection tag', () => {
    const text = common.getCollectionLogicText(i18n, {
      collectionLogic: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
      collectionTag: { name: 'prod' },
    });
    expect(text).toBe(
      'message.collection_logic_metrics_by_aggregate_direct_children_with_tags|prod',
    );
  });

  it('returns an empty text for an unknown logic', () => {
    expect(common.getCollectionLogicText(i18n, { collectionLogic: 'X' })).toBe(
      '',
    );
  });

  it('escapes double quotes in the collection tag', () => {
    const text = common.getCollectionLogicText(i18n, {
      collectionLogic: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
      collectionTag: { name: 'a"b' },
    });
    expect(text).toMatch(/\|a&quot;b$/);
  });

  it('copes with a missing collection tag', () => {
    const text = common.getCollectionLogicText(i18n, {
      collectionLogic: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
    });
    expect(text).toMatch(/\|$/);
  });
});
