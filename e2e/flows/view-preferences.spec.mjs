import { seed } from '../api.mjs';
import { test, expect, login, chooseProjectView } from '../test.mjs';

const findings = (s) => `api/v1/finding/project/${s.project.uuid}?suppressed=`;
const epss = (s) => `api/v1/finding/project/${s.project.uuid}?epssFrom=0`;

const switches = [
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

test('remember the flat project view', async ({ page }) => {
  await login(page);
  await page.goto('projects');
  await chooseProjectView(page, 'Flat');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Flat', pressed: true }),
  ).toBeVisible();
  await chooseProjectView(page, 'Tree');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Tree', pressed: true }),
  ).toBeVisible();
});

test('remember shown and hidden project list columns', async ({ page }) => {
  await login(page);
  // Keys as saved before the switch to the v2 API.
  await page.evaluate(() => {
    localStorage.setItem('ProjectListShowLastbomimport', 'false');
    localStorage.setItem('ProjectListShowIslatest', 'true');
  });
  await page.goto('projects');
  await expect(
    page.getByRole('columnheader', { name: 'Latest', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('columnheader', { name: 'Last BOM Import' }),
  ).toBeHidden();
  const classifier = page.getByRole('columnheader', { name: 'Classifier' });
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Classifier' }).uncheck();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(
    page.getByRole('columnheader', { name: 'Version' }),
  ).toBeVisible();
  await expect(classifier).toBeHidden();
});

for (const { view, url, label, table, param } of switches) {
  test(`remember "${label}" in the ${view}`, async ({ page }) => {
    await login(page);
    await page.goto(url(seed()));
    await page.getByText(label).click();
    await expect(page.getByLabel(label)).toBeChecked();
    await reloadExpectingTable(page, table, param);
    await expect(page.getByLabel(label)).toBeChecked();
    await page.getByText(label).click();
    await expect(page.getByLabel(label)).not.toBeChecked();
    await page.reload();
    await expect(page.getByLabel(label)).not.toBeChecked();
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
