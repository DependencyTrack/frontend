import { seed, uniqueName } from '../api.mjs';
import { test, expect, login, projectSearch } from '../test.mjs';

const graph = (s) =>
  `projects/${s.project.uuid}/dependencyGraph/${s.componentUuid}`;
const findings = (s) => `api/v1/finding/project/${s.project.uuid}?suppressed=`;
const epss = (s) => `api/v1/finding/project/${s.project.uuid}?epssFrom=0`;

const switches = [
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

test('restore active project filters from the project list URL', async ({
  page,
  api,
}) => {
  const prefix = uniqueName('e2e-active-filter');
  const active = `${prefix}-active`;
  const inactive = `${prefix}-inactive`;
  await api.send('PUT', '/v1/project', { name: active, active: true });
  await api.send('PUT', '/v1/project', { name: inactive, active: false });
  await login(page);
  await page.goto('projects');
  await projectSearch(page, prefix);
  const pill = page.getByRole('button', { name: 'Clear Active', exact: true });
  await expect(pill).toBeVisible();
  await expect(
    page.getByRole('link', { name: active, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeHidden();

  await pill.click();
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('show_inactive') === 'true',
  );
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeVisible();
  const reloaded = page.waitForResponse((res) => {
    const url = new URL(res.url());
    return (
      url.pathname === '/api/v2/projects' &&
      url.searchParams.get('name_contains') === prefix
    );
  });
  await page.reload();
  expect(new URL((await reloaded).url()).searchParams.has('state')).toBe(false);
  await expect(pill).toBeHidden();
  await expect(
    page.getByRole('link', { name: active, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByRole('menuitem', { name: 'Active', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL((url) => !url.searchParams.has('show_inactive'));
  await expect(pill).toBeVisible();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeHidden();
  await page.reload();
  await expect(pill).toBeVisible();
  await expect(
    page.getByRole('link', { name: active, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeHidden();

  await page.getByRole('button', { name: /^Active/ }).click();
  await page.getByRole('radio', { name: 'Only inactive', exact: true }).check();
  await expect(page).toHaveURL(
    (url) =>
      url.searchParams.get('state') === 'INACTIVE' &&
      !url.searchParams.has('show_inactive'),
  );
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: active, exact: true }),
  ).toBeHidden();
  await page.reload();
  await expect(pill).toBeVisible();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: active, exact: true }),
  ).toBeHidden();
});

test('remember the flat project view without restricting results to roots', async ({
  page,
  api,
}) => {
  const prefix = `zzz-${uniqueName('e2e-flat')}`;
  const parent = await api.send('PUT', '/v1/project', {
    name: `${prefix}-parent`,
  });
  const child = await api.send('PUT', '/v1/project', {
    name: `${prefix}-child`,
    parent: { uuid: parent.uuid },
  });
  await page.addInitScript(() => {
    localStorage.setItem('ProjectListSortName', 'name');
    localStorage.setItem('ProjectListSortOrder', 'desc');
  });
  await login(page);
  await page.goto('projects');
  const flatView = page.getByLabel('Show flat project view');
  const parentLink = page.getByRole('link', { name: parent.name, exact: true });
  const childLink = page.getByRole('link', { name: child.name, exact: true });
  await expect(parentLink).toBeVisible();
  await expect(childLink).toBeHidden();
  await page.getByText('Show flat project view').click();
  await expect(childLink).toBeVisible();
  await page.reload();
  await expect(flatView).toBeChecked();
  await expect(parentLink).toBeVisible();
  await expect(childLink).toBeVisible();

  await page.getByText('Show flat project view').click();
  await expect(childLink).toBeHidden();
  await page.reload();
  await expect(flatView).not.toBeChecked();
  await expect(parentLink).toBeVisible();
  await expect(childLink).toBeHidden();
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
