import { seed } from './api.mjs';
import { test, expect, login } from './test.mjs';

const heading = (name) => (main) => main.getByRole('heading', { name });
const tab = (name) => (main) => main.getByRole('tab', { name, selected: true });
const button = (name) => (main) => main.getByRole('button', { name });
const column = (name) => (main) => main.getByRole('columnheader', { name });
const cell = (name) => (main) => main.getByRole('cell', { name, exact: true });
const text = (value) => (main) => main.getByText(value);
const link = (name) => (main) => main.getByRole('link', { name, exact: true });
const inTab = (name, landmark) => (main, seed) =>
  landmark(main.getByRole('tabpanel', { name }), seed);
const projectName = (main, seed) => main.getByText(seed.project.name);
// The breadcrumb shows the same name before the page's own header.
const header = (name) => (main, seed) => main.getByText(name(seed)).nth(1);
const projectHeader = header((seed) => seed.project.name);
const componentHeader = header(() => 'jackson-databind');
const vulnHeader = header((seed) => seed.vulnId);
const vulnIdLink = (main, seed) => link(seed.vulnId)(main);

const project = 'projects/:project';
const component = 'components/:component';
const vulnerability = 'vulnerabilities/INTERNAL/:vulnId';
const license = 'licenses/Apache-2.0';
// Opening a finding requests its analysis, which doesn't exist yet.
const noAnalysis = /^GET \/api\/v1\/analysis\?.* 404$/;

const routes = [
  { path: 'dashboard', landmark: heading('Portfolio Vulnerabilities') },
  { path: 'projects', landmark: button('Create Project') },
  { path: project, landmark: projectHeader },
  { path: `${project}/overview`, landmark: projectHeader },
  {
    path: `${project}/components`,
    landmark: inTab(/Components/, link('jackson-core')),
  },
  { path: `${project}/collectionprojects`, landmark: projectHeader },
  {
    path: `${project}/services`,
    landmark: inTab(/Services/, link('e2e-service')),
  },
  {
    path: `${project}/dependencyGraph`,
    landmark: inTab(/Dependency Graph/, projectName),
  },
  {
    path: `${project}/dependencyGraph/:component`,
    landmark: inTab(/Dependency Graph/, text('jackson-databind')),
  },
  {
    path: `${project}/findings`,
    landmark: inTab(/Audit Vulnerabilities/, link('jackson-databind')),
  },
  {
    path: `${project}/findings/:vulnUuid`,
    landmark: inTab(/Audit Vulnerabilities/, vulnIdLink),
    allow: [noAnalysis],
  },
  {
    path: `${project}/findings/:component/:vulnUuid`,
    landmark: inTab(/Audit Vulnerabilities/, vulnIdLink),
    allow: [noAnalysis],
  },
  { path: `${project}/epss`, landmark: tab(/Exploit Predictions/) },
  { path: `${project}/policyViolations`, landmark: tab(/Policy Violations/) },
  { path: 'components', landmark: column('Package URL (PURL)') },
  { path: component, landmark: componentHeader },
  { path: `${component}/overview`, landmark: componentHeader },
  {
    path: `${component}/vulnerabilities`,
    landmark: inTab(/Vulnerabilities/, link(/^E2E-/)),
  },
  {
    path: 'services/:service',
    landmark: header(() => 'e2e-service'),
    // ServiceDetailsModal binds service.provider.name, and the seeded service has no provider.
    allow: [
      /TypeError: Cannot read properties of undefined \(reading 'name'\)/,
    ],
  },
  { path: 'vulnerabilities', landmark: button('Create Vulnerability') },
  { path: vulnerability, landmark: vulnHeader },
  {
    path: `${vulnerability}/overview`,
    landmark: vulnHeader,
  },
  {
    path: `${vulnerability}/affectedProjects`,
    landmark: inTab(/Affected Projects/, (main, seed) =>
      link(seed.project.name)(main),
    ),
  },
  { path: 'tags', landmark: column('Collection Projects') },
  { path: 'licenses', landmark: button('Add License') },
  { path: license, landmark: inTab(/Overview/, cell('Apache License 2.0')) },
  {
    path: `${license}/overview`,
    landmark: inTab(/Overview/, cell('Apache License 2.0')),
  },
  {
    path: `${license}/licenseText`,
    landmark: inTab(/License Text/, text(/TERMS AND CONDITIONS/)),
  },
  { path: `${license}/template`, landmark: tab('Template') },
  { path: `${license}/header`, landmark: tab('Source Header') },
  { path: 'policy', landmark: tab(/Policies/) },
  { path: 'policy/policies', landmark: tab(/Policies/) },
  { path: 'policy/licenseGroups', landmark: tab(/License Groups/) },
  { path: 'policy/vulnerability', landmark: tab(/Vulnerability Policies/) },
  {
    path: 'policy/vulnerability/new',
    landmark: heading('Create Vulnerability Policy'),
  },
  {
    path: 'policy/vulnerability/:vulnPolicy',
    // The seeded policy logs only; a new one applies.
    landmark: (main) =>
      main.getByRole('combobox', { name: 'Operation Mode' }).filter({
        has: main.page().getByRole('option', {
          name: 'Log Only',
          selected: true,
          includeHidden: true,
        }),
      }),
  },
  { path: 'policyViolationAudit', landmark: column('Risk Type') },
  {
    path: 'vulnerabilityAudit',
    landmark: tab('Vulnerabilities By Occurrence'),
  },
  {
    path: 'vulnerabilityAudit/occurrences',
    landmark: tab('Vulnerabilities By Occurrence'),
  },
  {
    path: 'vulnerabilityAudit/grouped',
    landmark: tab('Grouped Vulnerabilities'),
  },
  { path: 'admin', landmark: text('Base URL') },
  { path: 'admin/configuration', landmark: text('Base URL') },
  { path: 'admin/configuration/general', landmark: text('Base URL') },
  {
    path: 'admin/configuration/bomFormats',
    landmark: text('Enable CycloneDX'),
  },
  {
    path: 'admin/configuration/welcomeMessage',
    landmark: text('Enable welcome message'),
  },
  { path: 'admin/configuration/banner', landmark: text('Activate banner') },
  {
    path: 'admin/configuration/internalComponents',
    landmark: text(/Internal components will be excluded/),
  },
  {
    path: 'admin/configuration/maintenance',
    landmark: (main) => main.getByRole('group', { name: 'Retention' }),
  },
  {
    path: 'admin/configuration/riskscore',
    landmark: text(/calculates the risk score/),
  },
  {
    path: 'admin/configuration/telemetry',
    landmark: text('Enable telemetry submission'),
  },
  { path: 'admin/secrets/management', landmark: text('Secret Management') },
  {
    path: 'admin/analyzers/internal',
    landmark: text(/Whether the internal vulnerability analyzer/),
  },
  {
    path: 'admin/vulnerabilitySources/nvd',
    landmark: text(/Whether the NVD data source/),
    // Mirroring is off in compose.yaml.
    allow: [/^GET \/api\/v2\/vuln-data-sources\/nvd\/mirror-runs\/latest 404$/],
  },
  {
    path: 'admin/kevSources/cisa',
    landmark: text(/Whether the CISA KEV data source/),
    // Mirroring is off in compose.yaml.
    allow: [/^GET \/api\/v2\/kev-data-sources\/cisa\/mirror-runs\/latest 404$/],
  },
  { path: 'admin/repositories', landmark: cell('crates.io') },
  { path: 'admin/repositories/cargo', landmark: cell('crates.io') },
  { path: 'admin/repositories/composer', landmark: cell('packagist') },
  { path: 'admin/repositories/cpan', landmark: cell('cpan-public-registry') },
  { path: 'admin/repositories/gem', landmark: cell('rubygems.org') },
  { path: 'admin/repositories/github', landmark: cell('github') },
  { path: 'admin/repositories/goModules', landmark: cell('proxy.golang.org') },
  { path: 'admin/repositories/hackage', landmark: cell('hackage.haskell') },
  { path: 'admin/repositories/hex', landmark: cell('hex.pm') },
  { path: 'admin/repositories/maven', landmark: cell('central') },
  { path: 'admin/repositories/nixpkgs', landmark: cell('nixos.org') },
  { path: 'admin/repositories/npm', landmark: cell('npm-public-registry') },
  { path: 'admin/repositories/nuget', landmark: cell('nuget-gallery') },
  { path: 'admin/repositories/python', landmark: cell('pypi.org') },
  { path: 'admin/notifications', landmark: button('Create Alert') },
  { path: 'admin/notifications/alerts', landmark: button('Create Alert') },
  {
    path: 'admin/notifications/templates',
    landmark: button('Create Template'),
  },
  {
    path: 'admin/notifications/publishers',
    landmark: text('Email Notification Publisher'),
  },
  {
    path: 'admin/notifications/publishers/email',
    landmark: text('Email Notification Publisher'),
  },
  {
    path: 'admin/integrations',
    landmark: text('Enable Fortify SSC integration'),
  },
  {
    path: 'admin/integrations/fortifySSC',
    landmark: text('Enable Fortify SSC integration'),
  },
  {
    path: 'admin/integrations/defectDojo',
    landmark: text('Enable DefectDojo integration'),
  },
  {
    path: 'admin/integrations/kennaSecurity',
    landmark: text('Enable Kenna Security integration'),
  },
  { path: 'admin/accessManagement', landmark: column('Distinguished name') },
  {
    path: 'admin/accessManagement/ldapUsers',
    landmark: column('Distinguished name'),
  },
  {
    path: 'admin/accessManagement/managedUsers',
    landmark: column('Full name'),
  },
  {
    path: 'admin/accessManagement/oidcUsers',
    landmark: column('Subject Identifier'),
  },
  {
    path: 'admin/accessManagement/oidcGroups',
    landmark: button('Create Group'),
  },
  {
    path: 'admin/accessManagement/serviceAccounts',
    landmark: column('Suspended'),
  },
  {
    path: 'admin/accessManagement/workloadIdentityProviders',
    landmark: text(/Trusted token issuers/),
  },
  { path: 'admin/accessManagement/teams', landmark: button('Create Team') },
  {
    path: 'admin/accessManagement/permissions',
    landmark: cell('ACCESS_MANAGEMENT'),
  },
  {
    path: 'admin/accessManagement/portfolioAccessControl',
    landmark: text('Enable portfolio access control'),
  },
  { path: 'admin/workflows/taskQueues', landmark: column('Capacity') },
  { path: 'admin/workflows/runs', landmark: column('Workflow Name') },
  {
    path: 'admin/workflows/runs/:workflowRun',
    landmark: (main, seed) => text(seed.workflowRunId)(main),
  },
  { path: 'does-not-exist', landmark: heading('Oops! This is awkward') },
];

test.describe('authenticated', () => {
  test.beforeEach(({ page }) => login(page));

  for (const route of routes) {
    test(route.path, async ({ page, problems }) => {
      route.allow?.forEach((pattern) => problems.allow(pattern));
      await page.goto(resolve(route.path));
      await expect(
        route.landmark(page.getByRole('main'), seed()).first(),
      ).toBeVisible();
      // eslint-disable-next-line playwright/no-networkidle -- Lets the problems fixture see requests that finish after the landmark appears.
      await page.waitForLoadState('networkidle');
    });
  }
});

test('login', async ({ page }) => {
  await page.goto('login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('change-password', async ({ page }) => {
  await page.goto('change-password');
  await expect(
    page.getByRole('heading', { name: 'Update Password' }),
  ).toBeVisible();
});

function resolve(path) {
  const s = seed();
  const params = {
    project: s.project.uuid,
    component: s.componentUuid,
    service: s.serviceUuid,
    vulnId: s.vulnId,
    vulnUuid: s.vulnUuid,
    vulnPolicy: s.vulnPolicyUuid,
    workflowRun: s.workflowRunId,
  };
  return path.replace(/:(\w+)/g, (_, name) => params[name]);
}
