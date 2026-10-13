import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

const graph = (s) =>
  `projects/${s.project.uuid}/dependencyGraph/${s.componentUuid}`;
const findings = (s) => `api/v1/finding/project/${s.project.uuid}?suppressed=`;
const epss = (s) => `api/v1/finding/project/${s.project.uuid}?epssFrom=0`;

const switches = [
  {
    view: 'project list',
    url: () => 'projects',
    label: 'Show inactive projects',
  },
  {
    view: 'project list',
    url: () => 'projects',
    label: 'Show flat project view',
    table: () => 'api/v1/project/concise?',
    param: 'onlyRoot=false',
  },
  { view: 'dependency graph', url: graph, label: 'Show complete graph' },
  {
    view: 'dependency graph',
    url: graph,
    label: 'Highlight outdated components',
  },
  {
    view: 'affected projects',
    url: (s) => `vulnerabilities/INTERNAL/${s.vulnId}/affectedProjects`,
    label: 'Show inactive projects',
    table: (s) => `/vuln/${s.vulnId}/projects?`,
    param: 'excludeInactive=false',
  },
];

const pills = [
  {
    view: 'project findings',
    url: (s) => `projects/${s.project.uuid}/findings`,
    label: 'Show suppressed findings',
    table: findings,
    param: 'suppressed=true',
  },
  {
    view: 'project findings',
    url: (s) => `projects/${s.project.uuid}/findings`,
    label: 'KEV',
    table: findings,
    param: 'isKev=true',
  },
  {
    view: 'project exploit predictions',
    url: (s) => `projects/${s.project.uuid}/epss`,
    label: 'Show suppressed findings',
    table: epss,
    param: 'suppressed=true',
  },
  {
    view: 'project exploit predictions',
    url: (s) => `projects/${s.project.uuid}/epss`,
    label: 'KEV',
    table: epss,
    param: 'isKev=true',
  },
  {
    view: 'project policy violations',
    url: (s) => `projects/${s.project.uuid}/policyViolations`,
    label: 'Show suppressed violations',
    table: (s) => `api/v1/violation/project/${s.project.uuid}?`,
    param: 'suppressed=true',
  },
];

async function reloadExpectingTable(page, table, param) {
  if (!table) {
    await page.reload();
    return;
  }
  const path = table(seed());
  const request = page.waitForRequest((req) => req.url().includes(path));
  await page.reload();
  expect((await request).url()).toContain(param);
}

for (const { view, url, label, table, param } of switches) {
  test(`remember "${label}" in the ${view}`, async ({ page }) => {
    await login(page);
    await page.goto(url(seed()));
    await page.getByText(label).click();
    await expect(page.getByLabel(label)).toBeChecked();
    await reloadExpectingTable(page, table, param);
    await expect(page.getByLabel(label)).toBeChecked();
  });
}

for (const { view, url, label, table, param } of pills) {
  test(`remember the "${label}" filter in the ${view}`, async ({ page }) => {
    await login(page);
    await page.goto(url(seed()));
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('menuitem', { name: label, exact: true }).click();
    const pill = page.getByRole('button', { name: `Clear ${label}` });
    await expect(pill).toBeVisible();
    await reloadExpectingTable(page, table, param);
    await expect(pill).toBeVisible();
  });
}
