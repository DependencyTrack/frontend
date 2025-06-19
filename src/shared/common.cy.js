import common from '@/shared/common';

describe('Common', () => {
  describe('capitalize', () => {
    it('capitalizes the first letter and lowercases the rest', () => {
      expect(common.capitalize('hello')).to.equal('Hello');
      expect(common.capitalize('WORLD')).to.equal('World');
      expect(common.capitalize('javaScript')).to.equal('Javascript');
    });

    it('handles empty strings', () => {
      expect(common.capitalize('')).to.equal('');
    });

    it('handles strings with length <= 2', () => {
      expect(common.capitalize('a')).to.equal('a');
      expect(common.capitalize('ab')).to.equal('ab');
    });

    it('handles non-string inputs', () => {
      expect(common.capitalize(null)).to.equal(null);
      expect(common.capitalize(undefined)).to.equal(undefined);
    });
  });

  describe('formatTimestamp', () => {
    it('formats timestamp without time', () => {
      const timestamp = new Date(2023, 0, 15).getTime();
      const formatted = common.formatTimestamp(timestamp, false);
      expect(formatted).to.equal('15 Jan 2023');
    });

    it('formats timestamp with time', () => {
      const timestamp = new Date(2023, 0, 15, 14, 30, 45).getTime();
      const formatted = common.formatTimestamp(timestamp, true);
      expect(formatted).to.equal('15 Jan 2023 at 14:30:45');
    });

    it('pads single-digit hours, minutes, and seconds with zeros', () => {
      const timestamp = new Date(2023, 0, 5, 5, 5, 5).getTime();
      const formatted = common.formatTimestamp(timestamp, true);
      expect(formatted).to.equal('5 Jan 2023 at 05:05:05');
    });
  });

  describe('toBoolean', () => {
    it('converts string representations of true to boolean true', () => {
      expect(common.toBoolean('true')).to.be.true;
      expect(common.toBoolean('TRUE')).to.be.true;
      expect(common.toBoolean('yes')).to.be.true;
      expect(common.toBoolean('YES')).to.be.true;
      expect(common.toBoolean('1')).to.be.true;
      expect(common.toBoolean(true)).to.be.true;
    });

    it('converts string representations of false to boolean false', () => {
      expect(common.toBoolean('false')).to.be.false;
      expect(common.toBoolean('FALSE')).to.be.false;
      expect(common.toBoolean('no')).to.be.false;
      expect(common.toBoolean('NO')).to.be.false;
      expect(common.toBoolean('0')).to.be.false;
      expect(common.toBoolean(false)).to.be.false;
      expect(common.toBoolean(null)).to.be.false;
      expect(common.toBoolean('')).to.be.false;
    });

    it('handles other values', () => {
      expect(common.toBoolean('something else')).to.be.true;
      expect(common.toBoolean('123')).to.be.true;
    });
  });

  describe('trimToNull', () => {
    it('returns null for undefined values', () => {
      expect(common.trimToNull(undefined)).to.be.null;
    });

    it('returns null for blank strings', () => {
      expect(common.trimToNull('')).to.be.null;
      expect(common.trimToNull('   ')).to.be.null;
    });

    it('returns the original value for non-blank strings and other types', () => {
      expect(common.trimToNull('hello')).to.equal('hello');
      expect(common.trimToNull('  hello  ')).to.equal('  hello  ');
      expect(common.trimToNull(123)).to.equal(123);
      expect(common.trimToNull(0)).to.equal(0);
      expect(common.trimToNull(false)).to.equal(false);
    });
  });

  describe('calcProgressPercent', () => {
    it('calculates percentage correctly', () => {
      expect(common.calcProgressPercent(100, 50)).to.equal(50);
      expect(common.calcProgressPercent(200, 50)).to.equal(25);
      expect(common.calcProgressPercent(100, 33)).to.equal(33);
    });

    it('rounds to one decimal place', () => {
      expect(common.calcProgressPercent(3, 1)).to.equal(33.3);
      expect(common.calcProgressPercent(3, 2)).to.equal(66.7);
    });

    it('returns 0 when total or completed is 0', () => {
      expect(common.calcProgressPercent(0, 10)).to.equal(0);
      expect(common.calcProgressPercent(10, 0)).to.equal(0);
      expect(common.calcProgressPercent(0, 0)).to.equal(0);
    });

    it('returns 100 when completed is greater than or equal to total', () => {
      expect(common.calcProgressPercent(100, 100)).to.equal(100);
      expect(common.calcProgressPercent(100, 150)).to.equal(100);
    });
  });

  describe('concatenateComponentName', () => {
    it('concatenates group, name, and version correctly', () => {
      expect(
        common.concatenateComponentName('org.example', 'library', '1.0.0'),
      ).to.equal('org.example library 1.0.0');
    });

    it('handles missing group', () => {
      expect(
        common.concatenateComponentName(null, 'library', '1.0.0'),
      ).to.equal('library 1.0.0');
      expect(common.concatenateComponentName('', 'library', '1.0.0')).to.equal(
        'library 1.0.0',
      );
    });

    it('handles missing version', () => {
      expect(
        common.concatenateComponentName('org.example', 'library', null),
      ).to.equal('org.example library');
      expect(
        common.concatenateComponentName('org.example', 'library', ''),
      ).to.equal('org.example library');
    });

    it('handles missing name', () => {
      expect(
        common.concatenateComponentName('org.example', null, '1.0.0'),
      ).to.equal('org.example  1.0.0');
      expect(
        common.concatenateComponentName('org.example', '', '1.0.0'),
      ).to.equal('org.example  1.0.0');
    });

    it('handles all values missing', () => {
      expect(common.concatenateComponentName(null, null, null)).to.equal('');
      expect(common.concatenateComponentName('', '', '')).to.equal('');
    });
  });

  describe('valueWithDefault', () => {
    it('returns the variable if it is truthy', () => {
      expect(common.valueWithDefault('hello', 'default')).to.equal('hello');
      expect(common.valueWithDefault(123, 0)).to.equal(123);
      expect(common.valueWithDefault(true, false)).to.equal(true);
    });

    it('returns the default value if the variable is falsy', () => {
      expect(common.valueWithDefault(null, 'default')).to.equal('default');
      expect(common.valueWithDefault(undefined, 'default')).to.equal('default');
      expect(common.valueWithDefault('', 'default')).to.equal('default');
      expect(common.valueWithDefault(0, 123)).to.equal(123);
      expect(common.valueWithDefault(false, true)).to.equal(true);
    });
  });

  describe('formatSourceLabel', () => {
    it('formats source label correctly', () => {
      const result = common.formatSourceLabel('NVD');
      expect(result).to.equal(
        '<span class="label label-source label-source-nvd">NVD</span>',
      );
    });

    it('handles null or undefined source', () => {
      expect(common.formatSourceLabel(null)).to.be.null;
      expect(common.formatSourceLabel(undefined)).to.be.null;
    });
  });

  describe('formatNotificationLabel', () => {
    it('formats notification label correctly', () => {
      const result = common.formatNotificationLabel('WARN');
      expect(result).to.equal(
        '<span class="label label-notification label-notification-warn">WARN</span>',
      );
    });

    it('handles null or undefined violationState', () => {
      expect(common.formatNotificationLabel(null)).to.be.null;
      expect(common.formatNotificationLabel(undefined)).to.be.null;
    });
  });

  describe('formatProjectTagLabel', () => {
    it('formats project tag label correctly', () => {
      const mockRouter = {
        resolve: () => ({ href: '/projects?tag=test' }),
      };
      const tag = { name: 'test' };
      const result = common.formatProjectTagLabel(mockRouter, tag);
      expect(result).to.equal(
        '<a href="/projects?tag=test" class="badge badge-tag text-lowercase mr-1">test</a>',
      );
    });

    it('handles null or undefined tag', () => {
      const mockRouter = {
        resolve: () => ({ href: '/projects?tag=test' }),
      };
      expect(common.formatProjectTagLabel(mockRouter, null)).to.equal('');
      expect(common.formatProjectTagLabel(mockRouter, undefined)).to.equal('');
    });
  });

  describe('formatSeverityLabel', () => {
    it('formats severity label correctly', () => {
      const result = common.formatSeverityLabel('critical');
      expect(result).to.include('severity-critical-bg');
      expect(result).to.include('Critical');
    });

    it('handles null or undefined severity', () => {
      expect(common.formatSeverityLabel(null)).to.equal('');
      expect(common.formatSeverityLabel(undefined)).to.equal('');
    });
  });

  describe('formatViolationStateLabel', () => {
    it('formats violation state label correctly', () => {
      const result = common.formatViolationStateLabel('FAIL');
      expect(result).to.equal(
        '<span class="label label-notification label-notification-fail">FAIL</span>',
      );
    });

    it('handles null or undefined violationState', () => {
      expect(common.formatViolationStateLabel(null)).to.be.null;
      expect(common.formatViolationStateLabel(undefined)).to.be.null;
    });
  });

  describe('formatCweLabel', () => {
    it('formats CWE label correctly', () => {
      const result = common.formatCweLabel('79', 'Cross-site Scripting');
      expect(result).to.equal(
        "<div class='truncate-ellipsis'><span>CWE-79 Cross-site Scripting</span></div>",
      );
    });

    it('handles missing cweId or cweName', () => {
      expect(common.formatCweLabel(null, 'Cross-site Scripting')).to.equal('');
      expect(common.formatCweLabel('79', null)).to.equal('');
      expect(common.formatCweLabel(null, null)).to.equal('');
    });
  });

  describe('formatCweShortLabel', () => {
    it('formats CWE short label correctly', () => {
      const result = common.formatCweShortLabel('79', 'Cross-site Scripting');
      expect(result).to.equal(
        "<span data-toggle='tooltip' data-placement='bottom' title='Cross-site Scripting'>CWE-79</span>",
      );
    });

    it('handles missing cweId or cweName', () => {
      expect(common.formatCweShortLabel(null, 'Cross-site Scripting')).to.equal(
        '',
      );
      expect(common.formatCweShortLabel('79', null)).to.equal('');
      expect(common.formatCweShortLabel(null, null)).to.equal('');
    });
  });

  describe('formatAnalyzerLabel', () => {
    it('formats INTERNAL_ANALYZER label correctly', () => {
      const result = common.formatAnalyzerLabel(
        'INTERNAL_ANALYZER',
        'GITHUB',
        'GHSA-1234',
        null,
        null,
      );
      expect(result).to.include('GITHUB');
      expect(result).to.include('https://github.com/advisories/GHSA-1234');
    });

    it('formats OSSINDEX_ANALYZER label correctly', () => {
      const result = common.formatAnalyzerLabel(
        'OSSINDEX_ANALYZER',
        null,
        'pkg:npm/lodash@4.17.15',
        null,
        null,
      );
      expect(result).to.include('OSS Index');
      expect(result).to.include(
        'https://ossindex.sonatype.org/vuln/pkg:npm/lodash@4.17.15',
      );
    });

    it('formats VULNDB_ANALYZER label correctly', () => {
      const result = common.formatAnalyzerLabel(
        'VULNDB_ANALYZER',
        null,
        '12345',
        null,
        null,
      );
      expect(result).to.include('VulnDB');
      expect(result).to.include(
        'https://vulndb.cyberriskanalytics.com/vulnerabilities/12345',
      );
    });

    it('formats SNYK_ANALYZER label correctly', () => {
      const result = common.formatAnalyzerLabel(
        'SNYK_ANALYZER',
        null,
        'SNYK-JS-LODASH-567746',
        null,
        null,
      );
      expect(result).to.include('Snyk');
      expect(result).to.include(
        'https://security.snyk.io/vuln/SNYK-JS-LODASH-567746',
      );
    });

    it('formats TRIVY_ANALYZER label correctly', () => {
      const result = common.formatAnalyzerLabel(
        'TRIVY_ANALYZER',
        'NVD',
        'CVE-2021-44228',
        null,
        null,
      );
      expect(result).to.include('Trivy');
      expect(result).to.include(
        'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
      );
    });

    it('handles null or undefined analyzer', () => {
      expect(common.formatAnalyzerLabel(null, null, null, null, null)).to.be
        .null;
      expect(common.formatAnalyzerLabel(undefined, null, null, null, null)).to
        .be.null;
    });
  });

  describe('resolveSourceVulnInfo', () => {
    it('resolves NVD source info correctly', () => {
      const result = common.resolveSourceVulnInfo('NVD', 'CVE-2021-44228');
      expect(result.source).to.equal('NVD');
      expect(result.vulnId).to.equal('CVE-2021-44228');
      expect(result.name).to.equal('National Vulnerability Database');
      expect(result.url).to.equal(
        'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
      );
    });

    it('resolves GITHUB source info correctly', () => {
      const result = common.resolveSourceVulnInfo('GITHUB', 'GHSA-1234');
      expect(result.source).to.equal('GITHUB');
      expect(result.vulnId).to.equal('GHSA-1234');
      expect(result.name).to.equal('GitHub Advisories');
      expect(result.url).to.equal('https://github.com/advisories/GHSA-1234');
    });

    it('resolves OSSINDEX source info correctly', () => {
      const result = common.resolveSourceVulnInfo(
        'OSSINDEX',
        'pkg:npm/lodash@4.17.15',
      );
      expect(result.source).to.equal('OSSINDEX');
      expect(result.vulnId).to.equal('pkg:npm/lodash@4.17.15');
      expect(result.name).to.equal('OSS Index');
      expect(result.url).to.equal(
        'https://ossindex.sonatype.org/vuln/pkg:npm/lodash@4.17.15',
      );
    });

    it('resolves SNYK source info correctly', () => {
      const result = common.resolveSourceVulnInfo(
        'SNYK',
        'SNYK-JS-LODASH-567746',
      );
      expect(result.source).to.equal('SNYK');
      expect(result.vulnId).to.equal('SNYK-JS-LODASH-567746');
      expect(result.name).to.equal('Snyk');
      expect(result.url).to.equal(
        'https://security.snyk.io/vuln/SNYK-JS-LODASH-567746',
      );
    });

    it('resolves OSV source info correctly', () => {
      const result = common.resolveSourceVulnInfo('OSV', 'OSV-2021-1234');
      expect(result.source).to.equal('OSV');
      expect(result.vulnId).to.equal('OSV-2021-1234');
      expect(result.name).to.equal('Open Source Vulnerability Database');
      expect(result.url).to.equal(
        'https://osv.dev/vulnerability/OSV-2021-1234',
      );
    });

    it('resolves GSD source info correctly', () => {
      const result = common.resolveSourceVulnInfo('GSD', 'GSD-2021-1234');
      expect(result.source).to.equal('GSD');
      expect(result.vulnId).to.equal('GSD-2021-1234');
      expect(result.name).to.equal('Global Security Database');
      expect(result.url).to.equal(
        'https://github.com/cloudsecurityalliance/gsd-database',
      );
    });

    it('resolves VULNDB source info correctly', () => {
      const result = common.resolveSourceVulnInfo('VULNDB', '12345');
      expect(result.source).to.equal('VULNDB');
      expect(result.vulnId).to.equal('12345');
      expect(result.name).to.equal('VulnDB');
      expect(result.url).to.equal(
        'https://vulndb.cyberriskanalytics.com/vulnerabilities/12345',
      );
    });

    it('handles UNKNOWN source', () => {
      const result = common.resolveSourceVulnInfo('UNKNOWN', '12345');
      expect(result.source).to.equal('UNKNOWN');
      expect(result.vulnId).to.equal('12345');
      expect(result.name).to.be.undefined;
      expect(result.url).to.be.undefined;
    });
  });

  describe('resolveVulnAliases', () => {
    it('resolves vulnerability aliases correctly', () => {
      const aliases = [
        {
          cveId: 'CVE-2021-44228',
          ghsaId: 'GHSA-jfh8-c2jp-5v3q',
          sonatypeId: 'sonatype-2021-1234',
          snykId: 'SNYK-JAVA-ORGAPACHELOGGINGLOG4J-2314720',
          osvId: 'OSV-2021-1774',
        },
      ];

      const result = common.resolveVulnAliases('NVD', aliases);

      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);

      const nvdAlias = result.find((a) => a.source === 'NVD');
      expect(nvdAlias).to.be.undefined;

      const ghsaAlias = result.find((a) => a.source === 'GITHUB');
      expect(ghsaAlias).to.not.be.undefined;
      expect(ghsaAlias.vulnId).to.equal('GHSA-jfh8-c2jp-5v3q');

      const ossindexAlias = result.find((a) => a.source === 'OSSINDEX');
      expect(ossindexAlias).to.not.be.undefined;
      expect(ossindexAlias.vulnId).to.equal('sonatype-2021-1234');
    });

    it('handles null or undefined aliases', () => {
      expect(common.resolveVulnAliases('NVD', null)).to.deep.equal([]);
      expect(common.resolveVulnAliases('NVD', undefined)).to.deep.equal([]);
    });

    it('handles null or undefined vulnSource', () => {
      const aliases = [
        {
          cveId: 'CVE-2021-44228',
          ghsaId: 'GHSA-jfh8-c2jp-5v3q',
        },
      ];

      expect(common.resolveVulnAliases(null, aliases)).to.deep.equal([]);
      expect(common.resolveVulnAliases(undefined, aliases)).to.deep.equal([]);
    });
  });

  describe('sleep', () => {
    it('sleeps for the specified duration', () => {
      const start = Date.now();
      common.sleep(50);
      const end = Date.now();
      expect(end - start).to.be.at.least(50);
    });
  });

  describe('OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX', () => {
    it('has the correct structure and values', () => {
      const matrix = common.OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX;

      expect(matrix).to.have.property('LOW');
      expect(matrix).to.have.property('MEDIUM');
      expect(matrix).to.have.property('HIGH');
      expect(matrix).to.have.property('UNASSIGNED');

      expect(matrix.LOW).to.have.property('LOW', 'INFO');
      expect(matrix.LOW).to.have.property('MEDIUM', 'LOW');
      expect(matrix.LOW).to.have.property('HIGH', 'MEDIUM');

      expect(matrix.MEDIUM).to.have.property('LOW', 'LOW');
      expect(matrix.MEDIUM).to.have.property('MEDIUM', 'MEDIUM');
      expect(matrix.MEDIUM).to.have.property('HIGH', 'HIGH');

      expect(matrix.HIGH).to.have.property('LOW', 'MEDIUM');
      expect(matrix.HIGH).to.have.property('MEDIUM', 'HIGH');
      expect(matrix.HIGH).to.have.property('HIGH', 'CRITICAL');

      expect(matrix.UNASSIGNED).to.have.property('LOW', 'UNASSIGNED');
      expect(matrix.UNASSIGNED).to.have.property('MEDIUM', 'UNASSIGNED');
      expect(matrix.UNASSIGNED).to.have.property('HIGH', 'UNASSIGNED');
    });
  });

  describe('makeAnalysisStateLabelFormatter', () => {
    it('formats analysis state labels correctly', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.', ''),
      };

      const formatter = common.makeAnalysisStateLabelFormatter(mockI18n);

      expect(formatter('APPROVED')).to.equal('approved');
      expect(formatter('REJECTED')).to.equal('rejected');
      expect(formatter('NOT_SET')).to.equal('not_set');
      expect(formatter('EXPLOITABLE')).to.equal('exploitable');
      expect(formatter('IN_TRIAGE')).to.equal('in_triage');
      expect(formatter('FALSE_POSITIVE')).to.equal('false_positive');
      expect(formatter('NOT_AFFECTED')).to.equal('not_affected');
      expect(formatter('RESOLVED')).to.equal('resolved');
    });

    it('handles unknown values', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.', ''),
      };

      const formatter = common.makeAnalysisStateLabelFormatter(mockI18n);

      expect(formatter('UNKNOWN_VALUE')).to.be.null;
    });
  });

  describe('makeAnalysisJustificationLabelFormatter', () => {
    it('formats analysis justification labels correctly', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.', ''),
      };

      const formatter =
        common.makeAnalysisJustificationLabelFormatter(mockI18n);

      expect(formatter('NOT_SET')).to.equal('not_set');
      expect(formatter('CODE_NOT_PRESENT')).to.equal('code_not_present');
      expect(formatter('CODE_NOT_REACHABLE')).to.equal('code_not_reachable');
      expect(formatter('REQUIRES_CONFIGURATION')).to.equal(
        'requires_configuration',
      );
      expect(formatter('REQUIRES_DEPENDENCY')).to.equal('requires_dependency');
      expect(formatter('REQUIRES_ENVIRONMENT')).to.equal(
        'requires_environment',
      );
      expect(formatter('PROTECTED_BY_COMPILER')).to.equal(
        'protected_by_compiler',
      );
      expect(formatter('PROTECTED_AT_RUNTIME')).to.equal(
        'protected_at_runtime',
      );
      expect(formatter('PROTECTED_AT_PERIMETER')).to.equal(
        'protected_at_perimeter',
      );
      expect(formatter('PROTECTED_BY_MITIGATING_CONTROL')).to.equal(
        'protected_by_mitigating_control',
      );
    });

    it('handles unknown values', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.', ''),
      };

      const formatter =
        common.makeAnalysisJustificationLabelFormatter(mockI18n);

      expect(formatter('UNKNOWN_VALUE')).to.be.null;
    });
  });

  describe('componentClassifierLabelFormatter', () => {
    it('formats component classifier labels correctly', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.component_', ''),
      };

      const formatter = common.componentClassifierLabelFormatter(mockI18n);

      expect(formatter('APPLICATION')).to.equal('application');
      expect(formatter('FRAMEWORK')).to.equal('framework');
      expect(formatter('LIBRARY')).to.equal('library');
      expect(formatter('CONTAINER')).to.equal('container');
      expect(formatter('OPERATING_SYSTEM')).to.equal('operating_system');
      expect(formatter('DEVICE')).to.equal('device');
      expect(formatter('FIRMWARE')).to.equal('firmware');
      expect(formatter('FILE')).to.equal('file');
    });

    it('handles unknown values', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.component_', ''),
      };

      const formatter = common.componentClassifierLabelFormatter(mockI18n);

      expect(formatter('UNKNOWN_VALUE')).to.be.null;
    });
  });

  describe('componentClassifierLabelProjectUrlFormatter', () => {
    it('formats component classifier labels with URLs correctly', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.component_', ''),
      };

      const context = {
        routerFunc: () => ({
          resolve: (params) => ({
            href: `/projects?classifier=${params.query.classifier}`,
          }),
        }),
      };

      const formatter =
        common.componentClassifierLabelProjectUrlFormatter(mockI18n);

      const boundFormatter = formatter.bind(context);

      const result = boundFormatter('APPLICATION');
      expect(result).to.include('href="/projects?classifier=APPLICATION"');
      expect(result).to.include('>application</a>');
    });

    it('handles missing routerFunc', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.component_', ''),
      };

      const context = {};

      const formatter =
        common.componentClassifierLabelProjectUrlFormatter(mockI18n);

      const boundFormatter = formatter.bind(context);

      const result = boundFormatter('APPLICATION');
      expect(result).to.include('href="../projects/?classifier=APPLICATION"');
      expect(result).to.include('>application</a>');
    });

    it('handles unknown values', () => {
      const mockI18n = {
        $t: (key) => key.replace('message.component_', ''),
      };

      const context = {
        routerFunc: () => ({
          resolve: () => ({ href: '' }),
        }),
      };

      const formatter =
        common.componentClassifierLabelProjectUrlFormatter(mockI18n);

      const boundFormatter = formatter.bind(context);

      expect(boundFormatter('UNKNOWN_VALUE')).to.be.null;
    });
  });
});
