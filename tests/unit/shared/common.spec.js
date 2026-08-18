import common from '@/shared/common';
import { createTranslateStub } from '../../support/i18n';
import { normalizeHtml } from '../../support/html';

// The label formatters are factories that take an object exposing $t.
const createI18nStub = () => ({ $t: createTranslateStub() });

describe('shared/common', () => {
  describe('capitalize', () => {
    it('uppercases the first letter and lowercases the rest', () => {
      expect(common.capitalize('high')).toBe('High');
      expect(common.capitalize('HIGH')).toBe('High');
      expect(common.capitalize('aBc')).toBe('Abc');
    });

    it('returns strings of two characters or fewer unchanged', () => {
      // The `length > 2` guard means short strings are not normalized at all.
      expect(common.capitalize('ab')).toBe('ab');
      expect(common.capitalize('AB')).toBe('AB');
      expect(common.capitalize('a')).toBe('a');
      expect(common.capitalize('')).toBe('');
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('returns %s unchanged', (_label, value) => {
      expect(common.capitalize(value)).toBe(value);
    });
  });

  describe('titleCase', () => {
    it('converts a slug to title case', () => {
      expect(common.titleCase('oss-index')).toBe('Oss Index');
    });

    it('capitalizes a single word', () => {
      expect(common.titleCase('internal')).toBe('Internal');
      expect(common.titleCase('nvd')).toBe('Nvd');
    });

    it('leaves short words uncapitalized', () => {
      // Inherited from capitalize()'s `length > 2` guard.
      expect(common.titleCase('a-b')).toBe('a b');
    });

    it.each([
      ['an empty string', ''],
      ['null', null],
      ['undefined', undefined],
    ])('returns %s unchanged', (_label, value) => {
      expect(common.titleCase(value)).toBe(value);
    });
  });

  describe('formatSourceLabel', () => {
    it('renders a source-specific label', () => {
      const html = normalizeHtml(common.formatSourceLabel('NVD'));

      expect(html).toContain('label-source-nvd');
      expect(html).toContain('>NVD<');
    });

    it.each([
      ['null', null],
      ['an empty string', ''],
    ])('returns null for %s', (_label, value) => {
      expect(common.formatSourceLabel(value)).toBeNull();
    });
  });

  describe('formatNotificationLabel', () => {
    it('renders a state-specific label', () => {
      expect(normalizeHtml(common.formatNotificationLabel('FAIL'))).toContain(
        'label-notification-fail',
      );
    });

    it('returns null for a falsy state', () => {
      expect(common.formatNotificationLabel(null)).toBeNull();
    });
  });

  describe('formatViolationStateLabel', () => {
    it('renders a state-specific label', () => {
      expect(normalizeHtml(common.formatViolationStateLabel('WARN'))).toContain(
        'label-notification-warn',
      );
    });

    it('returns null for a falsy state', () => {
      expect(common.formatViolationStateLabel(null)).toBeNull();
    });
  });

  describe('formatSeverityLabel', () => {
    it('renders the severity class and capitalized value', () => {
      const html = normalizeHtml(common.formatSeverityLabel('CRITICAL'));

      expect(html).toContain('severity-critical-bg');
      expect(html).toContain('<span class="severity-value">Critical</span>');
    });

    it('returns an empty string for a falsy severity', () => {
      // Unlike its sibling formatters, which return null.
      expect(common.formatSeverityLabel(null)).toBe('');
    });
  });

  describe('formatCweLabel', () => {
    it('renders the id and name', () => {
      const html = normalizeHtml(
        common.formatCweLabel(79, 'Cross-site Scripting'),
      );

      expect(html).toContain('CWE-79 Cross-site Scripting');
    });

    it('returns an empty string when the name is missing', () => {
      expect(common.formatCweLabel(79, null)).toBe('');
    });

    it('returns an empty string when the id is zero', () => {
      expect(common.formatCweLabel(0, 'Some CWE')).toBe('');
    });
  });

  describe('formatCweShortLabel', () => {
    it('puts the name in the tooltip and only the id in the body', () => {
      const html = normalizeHtml(
        common.formatCweShortLabel(79, 'Cross-site Scripting'),
      );

      expect(html).toContain("title='Cross-site Scripting'");
      expect(html).toContain('>CWE-79</span>');
    });

    it('returns an empty string when either argument is missing', () => {
      expect(common.formatCweShortLabel(79, null)).toBe('');
      expect(common.formatCweShortLabel(null, 'Some CWE')).toBe('');
    });
  });

  describe('formatAnalyzerLabel', () => {
    it('returns null when there is no analyzer', () => {
      expect(
        common.formatAnalyzerLabel(null, 'NVD', 'CVE-2021-1234'),
      ).toBeNull();
    });

    it.each([
      ['GITHUB', 'GHSA-xxxx', 'https://github.com/advisories/GHSA-xxxx'],
      [
        'NVD',
        'CVE-2021-1234',
        'https://nvd.nist.gov/vuln/detail/CVE-2021-1234',
      ],
      ['OSV', 'GO-2021-1234', 'https://osv.dev/vulnerability/GO-2021-1234'],
    ])('links %s vulnerabilities to their source', (source, vulnId, url) => {
      const html = normalizeHtml(
        common.formatAnalyzerLabel('internal', source, vulnId),
      );

      expect(html).toContain(`href="${url}"`);
    });

    it('prefers an explicit reference URL over the source default', () => {
      const html = normalizeHtml(
        common.formatAnalyzerLabel(
          'internal',
          'NVD',
          'CVE-2021-1234',
          null,
          'https://example.com/advisory',
        ),
      );

      expect(html).toContain('href="https://example.com/advisory"');
      expect(html).not.toContain('nvd.nist.gov');
    });

    it('renders a plain span when no URL can be derived', () => {
      const html = normalizeHtml(
        common.formatAnalyzerLabel('internal', 'SNYK', 'SNYK-JS-1234'),
      );

      expect(html).toContain('label-analyzer-internal');
      expect(html).not.toContain('<a ');
    });

    it('title-cases the analyzer name', () => {
      expect(
        normalizeHtml(common.formatAnalyzerLabel('oss-index', 'SNYK', 'X')),
      ).toContain('Oss Index');
    });

    it('escapes an analyzer name containing markup', () => {
      const html = normalizeHtml(
        common.formatAnalyzerLabel('<script>alert(1)', 'SNYK', 'X'),
      );

      expect(html).toContain('&lt;script');
      expect(html).not.toContain('<script');
    });

    it('neutralizes a javascript: reference URL', () => {
      const html = normalizeHtml(
        common.formatAnalyzerLabel(
          'internal',
          'SNYK',
          'X',
          null,
          'javascript:alert(1)',
        ),
      );

      expect(html).toContain('href="x-javascript:alert(1)"');
      expect(html).not.toContain('href="javascript:');
    });
  });

  describe('resolveSourceVulnInfo', () => {
    it.each([
      [
        'NVD',
        'National Vulnerability Database',
        'https://nvd.nist.gov/vuln/detail/CVE-1',
      ],
      ['GITHUB', 'GitHub Advisories', 'https://github.com/advisories/CVE-1'],
      ['OSSINDEX', 'OSS Index', 'https://ossindex.sonatype.org/vuln/CVE-1'],
      ['SNYK', 'Snyk', 'https://security.snyk.io/vuln/CVE-1'],
      [
        'OSV',
        'Open Source Vulnerability Database',
        'https://osv.dev/vulnerability/CVE-1',
      ],
      [
        'VULNDB',
        'VulnDB',
        'https://vulndb.cyberriskanalytics.com/vulnerabilities/CVE-1',
      ],
    ])('resolves %s to its name and URL', (source, name, url) => {
      expect(common.resolveSourceVulnInfo(source, 'CVE-1')).toEqual({
        source,
        vulnId: 'CVE-1',
        name,
        url,
      });
    });

    it('resolves GSD to a URL that ignores the vulnerability id', () => {
      expect(common.resolveSourceVulnInfo('GSD', 'GSD-1').url).toBe(
        'https://github.com/cloudsecurityalliance/gsd-database',
      );
    });

    it.each(['INTERNAL', 'UNKNOWN', 'SOMETHING_ELSE'])(
      'returns only the identity for %s',
      (source) => {
        expect(common.resolveSourceVulnInfo(source, 'X')).toEqual({
          source,
          vulnId: 'X',
        });
      },
    );
  });

  describe('resolveVulnAliases', () => {
    it.each([
      ['the source is missing', null, [{ cveId: 'CVE-1' }]],
      ['the aliases are missing', 'NVD', null],
    ])('returns an empty array when %s', (_label, source, aliases) => {
      expect(common.resolveVulnAliases(source, aliases)).toEqual([]);
    });

    it('returns an empty array for an empty alias list', () => {
      expect(common.resolveVulnAliases('NVD', [])).toEqual([]);
    });

    it('excludes aliases that belong to the current source', () => {
      const aliases = common.resolveVulnAliases('NVD', [
        { cveId: 'CVE-1', ghsaId: 'GHSA-1' },
      ]);

      expect(aliases.map((alias) => alias.vulnId)).toEqual(['GHSA-1']);
    });

    it('deduplicates aliases sharing a vulnerability id', () => {
      const aliases = common.resolveVulnAliases('NVD', [
        { ghsaId: 'GHSA-1' },
        { ghsaId: 'GHSA-1' },
      ]);

      expect(aliases).toHaveLength(1);
    });

    it('sorts the aliases by vulnerability id', () => {
      const aliases = common.resolveVulnAliases('NVD', [
        { osvId: 'GO-2' },
        { ghsaId: 'GHSA-1' },
      ]);

      expect(aliases.map((alias) => alias.vulnId)).toEqual(['GHSA-1', 'GO-2']);
    });

    it('ignores alias objects without a recognized identifier', () => {
      expect(common.resolveVulnAliases('NVD', [{ somethingId: 'X' }])).toEqual(
        [],
      );
    });
  });

  describe('makeAnalysisStateLabelFormatter', () => {
    const format = (value) =>
      common.makeAnalysisStateLabelFormatter(createI18nStub())(value);

    it.each([
      'APPROVED',
      'REJECTED',
      'NOT_SET',
      'EXPLOITABLE',
      'IN_TRIAGE',
      'FALSE_POSITIVE',
      'NOT_AFFECTED',
      'RESOLVED',
    ])('translates %s', (state) => {
      expect(format(state)).toBe(`message.${state.toLowerCase()}`);
    });

    it.each([
      ['an unknown state', 'BOGUS'],
      ['null', null],
      ['undefined', undefined],
    ])('returns null for %s', (_label, value) => {
      expect(format(value)).toBeNull();
    });
  });

  describe('makeAnalysisJustificationLabelFormatter', () => {
    const format = (value) =>
      common.makeAnalysisJustificationLabelFormatter(createI18nStub())(value);

    it.each([
      'NOT_SET',
      'CODE_NOT_REACHABLE',
      'PROTECTED_BY_MITIGATING_CONTROL',
    ])('translates %s', (justification) => {
      expect(format(justification)).toBe(
        `message.${justification.toLowerCase()}`,
      );
    });

    it('returns null for an unknown justification', () => {
      expect(format('BOGUS')).toBeNull();
    });
  });

  describe('componentClassifierLabelFormatter', () => {
    const format = (value) =>
      common.componentClassifierLabelFormatter(createI18nStub())(value);

    it.each([
      'APPLICATION',
      'FRAMEWORK',
      'LIBRARY',
      'CONTAINER',
      'OPERATING_SYSTEM',
      'DEVICE',
      'FIRMWARE',
      'FILE',
    ])('translates %s with the component_ prefix', (classifier) => {
      expect(format(classifier)).toBe(
        `message.component_${classifier.toLowerCase()}`,
      );
    });

    it('returns null for an unknown classifier', () => {
      expect(format('BOGUS')).toBeNull();
    });
  });

  describe('componentClassifierLabelProjectUrlFormatter', () => {
    // The returned function reads `this.routerFunc`, so it has to be invoked
    // with an explicit receiver.
    const format = (context, value) =>
      common
        .componentClassifierLabelProjectUrlFormatter(createI18nStub())
        .call(context, value);

    it('falls back to a relative project URL without a router', () => {
      expect(format({}, 'APPLICATION')).toContain(
        'href="../projects/?classifier=APPLICATION"',
      );
    });

    it('uses the router to resolve the project URL when one is supplied', () => {
      const router = { resolve: jest.fn(() => ({ href: '/projects?c=LIB' })) };

      const html = format({ routerFunc: () => router }, 'LIBRARY');

      expect(router.resolve).toHaveBeenCalledWith({
        name: 'Projects',
        query: { classifier: 'LIBRARY' },
      });
      expect(html).toContain('href="/projects?c=LIB"');
    });

    it('returns null for an unknown classifier', () => {
      expect(format({}, 'BOGUS')).toBeNull();
    });
  });

  // These assertions depend on the suite running with TZ=UTC, which the npm
  // test scripts set via cross-env.
  describe('formatTimestamp', () => {
    it('formats a date without the time by default', () => {
      expect(common.formatTimestamp(1484471103000)).toBe('15 Jan 2017');
    });

    it('appends the time when asked', () => {
      expect(common.formatTimestamp(1484471103000, true)).toBe(
        '15 Jan 2017 at 09:05:03',
      );
    });

    it('zero-pads hours, minutes and seconds', () => {
      expect(common.formatTimestamp(1484442123000, true)).toBe(
        '15 Jan 2017 at 01:02:03',
      );
    });

    it('maps the last month of the year correctly', () => {
      expect(common.formatTimestamp(1609459199000)).toBe('31 Dec 2020');
    });
  });

  describe('formatRelative', () => {
    let $t;

    beforeEach(() => {
      $t = createTranslateStub();
    });

    it.each([
      ['zero', 0],
      ['just under ten seconds', 9999],
      ['a negative delta', -5000],
    ])('reports %s as just now', (_label, diffMs) => {
      expect(common.formatRelative(diffMs, $t)).toBe(
        'message.relative_just_now',
      );
    });

    it.each([
      [10000, 'message.relative_seconds_ago', 10],
      [59000, 'message.relative_seconds_ago', 59],
      [60000, 'message.relative_minutes_ago', 1],
      [3599000, 'message.relative_minutes_ago', 59],
      [3600000, 'message.relative_hours_ago', 1],
      [86399000, 'message.relative_hours_ago', 23],
      [86400000, 'message.relative_days_ago', 1],
    ])('formats %sms as %s with n=%s', (diffMs, key, n) => {
      common.formatRelative(diffMs, $t);

      expect($t).toHaveBeenCalledWith(key, { n });
    });
  });

  describe('concatenateComponentName', () => {
    it('joins group, name and version', () => {
      expect(common.concatenateComponentName('org.acme', 'lib', '1.0')).toBe(
        'org.acme lib 1.0',
      );
    });

    it('drops a whitespace-only group', () => {
      expect(common.concatenateComponentName('   ', 'lib', '1.0')).toBe(
        'lib 1.0',
      );
    });

    it('returns just the name when nothing else is given', () => {
      expect(common.concatenateComponentName(undefined, 'lib', undefined)).toBe(
        'lib',
      );
    });

    it('keeps the separator space in front of a lone version', () => {
      expect(common.concatenateComponentName(undefined, undefined, '1.0')).toBe(
        ' 1.0',
      );
    });

    it('returns an empty string when everything is missing', () => {
      expect(
        common.concatenateComponentName(undefined, undefined, undefined),
      ).toBe('');
    });
  });

  describe('valueWithDefault', () => {
    it.each([
      ['zero', 0],
      ['an empty string', ''],
      ['false', false],
      ['NaN', NaN],
      ['null', null],
      ['undefined', undefined],
    ])('falls back to the default for %s', (_label, value) => {
      expect(common.valueWithDefault(value, 'fallback')).toBe('fallback');
    });

    it('passes a truthy value through', () => {
      expect(common.valueWithDefault('actual', 'fallback')).toBe('actual');
    });
  });

  describe('calcProgressPercent', () => {
    it('reports no progress when the total is zero', () => {
      expect(common.calcProgressPercent(0, 5)).toBe(0);
    });

    it('reports no progress when nothing is completed', () => {
      expect(common.calcProgressPercent(5, 0)).toBe(0);
    });

    it('caps at 100 percent when completed exceeds the total', () => {
      expect(common.calcProgressPercent(5, 7)).toBe(100);
    });

    it('reports 100 percent when completed equals the total', () => {
      expect(common.calcProgressPercent(5, 5)).toBe(100);
    });

    it('rounds to one decimal place', () => {
      expect(common.calcProgressPercent(9, 7)).toBe(77.8);
      expect(common.calcProgressPercent(3, 1)).toBe(33.3);
    });
  });

  describe('toBoolean', () => {
    it.each(['true', 'TRUE', '  yes  ', '1'])('reads %s as true', (value) => {
      expect(common.toBoolean(value)).toBe(true);
    });

    it.each(['false', 'No', '0'])('reads %s as false', (value) => {
      expect(common.toBoolean(value)).toBe(false);
    });

    it.each([
      ['an empty string', ''],
      ['null', null],
      ['undefined', undefined],
    ])('reads %s as false', (_label, value) => {
      expect(common.toBoolean(value)).toBe(false);
    });

    it('passes booleans through', () => {
      expect(common.toBoolean(true)).toBe(true);
      expect(common.toBoolean(false)).toBe(false);
    });

    it('reads any other non-empty string as true', () => {
      // The default branch coerces with Boolean(), so unrecognized text is
      // truthy rather than false.
      expect(common.toBoolean('maybe')).toBe(true);
    });
  });

  describe('trimToNull', () => {
    it.each([
      ['undefined', undefined],
      ['an empty string', ''],
      ['a whitespace-only string', '   '],
    ])('returns null for %s', (_label, value) => {
      expect(common.trimToNull(value)).toBeNull();
    });

    it('returns a non-blank string unchanged', () => {
      expect(common.trimToNull('a')).toBe('a');
    });

    it('returns zero unchanged rather than null', () => {
      expect(common.trimToNull(0)).toBe(0);
    });

    it('returns null unchanged', () => {
      expect(common.trimToNull(null)).toBeNull();
    });
  });

  describe('setQueryParams', () => {
    it('keeps a relative URL relative', () => {
      expect(common.setQueryParams('/api/v2/secrets', { page: 2 })).toBe(
        '/api/v2/secrets?page=2',
      );
    });

    it('returns the full href for an absolute URL', () => {
      expect(
        common.setQueryParams('https://dt.example.com/api', { page: 2 }),
      ).toBe('https://dt.example.com/api?page=2');
    });

    it('appends one param per array entry', () => {
      expect(common.setQueryParams('/api', { tag: ['a', 'b'] })).toBe(
        '/api?tag=a&tag=b',
      );
    });

    it('skips null and undefined array entries', () => {
      expect(
        common.setQueryParams('/api', { tag: ['a', null, undefined] }),
      ).toBe('/api?tag=a');
    });

    it('replaces any pre-existing values when given an array', () => {
      expect(common.setQueryParams('/api?tag=old', { tag: ['new'] })).toBe(
        '/api?tag=new',
      );
    });

    it('leaves a pre-existing value alone for a null scalar', () => {
      expect(common.setQueryParams('/api?tag=old', { tag: null })).toBe(
        '/api?tag=old',
      );
    });

    it('preserves the fragment', () => {
      expect(common.setQueryParams('/api#section', { page: 2 })).toBe(
        '/api?page=2#section',
      );
    });
  });

  describe('sameQueryParams', () => {
    it('ignores key order', () => {
      expect(
        common.sameQueryParams({ a: '1', b: '2' }, { b: '2', a: '1' }),
      ).toBe(true);
    });

    it('treats a scalar and a single-element array as equal', () => {
      expect(common.sameQueryParams({ a: '1' }, { a: ['1'] })).toBe(true);
    });

    it('coerces values to strings before comparing', () => {
      expect(common.sameQueryParams({ a: 1 }, { a: '1' })).toBe(true);
    });

    it('ignores null and undefined values', () => {
      expect(common.sameQueryParams({ a: '1', b: null }, { a: '1' })).toBe(
        true,
      );
    });

    it('treats an empty object and null as equal', () => {
      expect(common.sameQueryParams({}, null)).toBe(true);
    });

    it('reports differing values as different', () => {
      expect(common.sameQueryParams({ a: '1' }, { a: '2' })).toBe(false);
    });
  });

  describe('getCollectionLogicText', () => {
    let i18n;

    beforeEach(() => {
      i18n = createI18nStub();
    });

    it('describes aggregation over direct children', () => {
      expect(
        common.getCollectionLogicText(i18n, {
          collectionLogic: 'AGGREGATE_DIRECT_CHILDREN',
        }),
      ).toBe('message.collection_logic_metrics_by_aggregate_direct_children');
    });

    it('passes the tag when aggregating by tag', () => {
      common.getCollectionLogicText(i18n, {
        collectionLogic: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
        collectionTag: { name: 'prod' },
      });

      expect(i18n.$t).toHaveBeenCalledWith(
        'message.collection_logic_metrics_by_aggregate_direct_children_with_tags',
        { tag: 'prod' },
      );
    });

    it('escapes a tag name containing a quote', () => {
      common.getCollectionLogicText(i18n, {
        collectionLogic: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
        collectionTag: { name: 'a"b' },
      });

      expect(i18n.$t).toHaveBeenCalledWith(expect.any(String), {
        tag: 'a&quot;b',
      });
    });

    it('passes an empty tag when the project has none', () => {
      common.getCollectionLogicText(i18n, {
        collectionLogic: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
      });

      expect(i18n.$t).toHaveBeenCalledWith(expect.any(String), { tag: '' });
    });

    it('describes aggregation over the latest version', () => {
      expect(
        common.getCollectionLogicText(i18n, {
          collectionLogic: 'AGGREGATE_LATEST_VERSION_CHILDREN',
        }),
      ).toBe('message.collection_logic_metrics_by_aggregate_latest_version');
    });

    it('returns an empty string for an unknown logic', () => {
      expect(
        common.getCollectionLogicText(i18n, { collectionLogic: 'NONE' }),
      ).toBe('');
    });
  });

  describe('OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX', () => {
    const matrix = common.OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX;

    it('maps the corners of the matrix', () => {
      expect(matrix.LOW.LOW).toBe('INFO');
      expect(matrix.LOW.HIGH).toBe('MEDIUM');
      expect(matrix.HIGH.LOW).toBe('MEDIUM');
      expect(matrix.HIGH.HIGH).toBe('CRITICAL');
    });

    it('maps every unassigned likelihood to an unassigned severity', () => {
      expect(matrix.UNASSIGNED).toEqual({
        LOW: 'UNASSIGNED',
        MEDIUM: 'UNASSIGNED',
        HIGH: 'UNASSIGNED',
      });
    });
  });

  describe('module export surface', () => {
    it('exports the documented set of members', () => {
      // The default export is maintained by hand, so a new function can be
      // added to the module without ever becoming reachable. Note that
      // makeAnalysisResponseLabelFormatter is defined in the module but is
      // absent here.
      expect(Object.keys(common).sort()).toEqual([
        'OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX',
        'calcProgressPercent',
        'capitalize',
        'componentClassifierLabelFormatter',
        'componentClassifierLabelProjectUrlFormatter',
        'concatenateComponentName',
        'formatAnalyzerLabel',
        'formatCweLabel',
        'formatCweShortLabel',
        'formatNotificationLabel',
        'formatProjectTagLabel',
        'formatProjectTeamLabel',
        'formatRelative',
        'formatSeverityLabel',
        'formatSourceLabel',
        'formatTimestamp',
        'formatViolationStateLabel',
        'formatVulnerabilityTagLabel',
        'getCollectionLogicText',
        'makeAnalysisJustificationLabelFormatter',
        'makeAnalysisStateLabelFormatter',
        'resolveSourceVulnInfo',
        'resolveVulnAliases',
        'sameQueryParams',
        'setQueryParams',
        'sleep',
        'titleCase',
        'toBoolean',
        'trimToNull',
        'valueWithDefault',
      ]);
    });
  });

  describe('formatProjectTagLabel', () => {
    const router = { resolve: jest.fn(() => ({ href: '/projects?tag=prod' })) };

    it('links the tag to the filtered project list', () => {
      const html = normalizeHtml(
        common.formatProjectTagLabel(router, { name: 'prod' }),
      );

      expect(html).toContain('href="/projects?tag=prod"');
      expect(html).toContain('>prod</a>');
    });

    it('escapes a tag name containing markup', () => {
      const html = normalizeHtml(
        common.formatProjectTagLabel(router, { name: '<script>' }),
      );

      expect(html).toContain('&lt;script>');
      expect(html).not.toContain('<script>');
    });

    it('returns an empty string when there is no tag', () => {
      expect(common.formatProjectTagLabel(router, null)).toBe('');
    });
  });

  describe('formatProjectTeamLabel', () => {
    const router = { resolve: jest.fn(() => ({ href: '/projects?team=ops' })) };

    it('links the team to the filtered project list', () => {
      expect(
        normalizeHtml(common.formatProjectTeamLabel(router, { name: 'ops' })),
      ).toContain('href="/projects?team=ops"');
    });

    it('returns an empty string when there is no team', () => {
      expect(common.formatProjectTeamLabel(router, null)).toBe('');
    });
  });

  describe('formatVulnerabilityTagLabel', () => {
    const router = {
      resolve: jest.fn(() => ({ href: '/vulnerabilities?tag=kev' })),
    };

    it('links the tag to the filtered vulnerability list', () => {
      expect(
        normalizeHtml(
          common.formatVulnerabilityTagLabel(router, { name: 'kev' }),
        ),
      ).toContain('href="/vulnerabilities?tag=kev"');
    });

    it('returns an empty string when there is no tag', () => {
      expect(common.formatVulnerabilityTagLabel(router, null)).toBe('');
    });
  });
});
