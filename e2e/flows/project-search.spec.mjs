import { seed, uniqueName } from '../api.mjs';
import { test, expect, login, projectSearch } from '../test.mjs';

test('filter the project list by name and open a project', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto('projects');
  await projectSearch(page, project.name);
  await page.getByRole('link', { name: project.name }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/${project.uuid}$`));
  await expect(
    page.getByRole('heading', { name: 'Project Vulnerabilities' }),
  ).toBeVisible();
});

test('show the metrics of a project in tooltips', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto('projects');
  await projectSearch(page, project.name);
  const row = page.getByRole('row').filter({ hasText: project.name });
  const violations = row
    .getByRole('progressbar', { name: 'Policy Violations' })
    .filter({ visible: true });
  const vulnerabilities = row
    .getByRole('progressbar', { name: 'Severity' })
    .filter({ visible: true });
  await expect(violations).toHaveAttribute(
    'aria-valuetext',
    /^Informational Violations: \d+, Violation Warnings: \d+, Violation Failures: \d+$/,
  );
  await violations.hover();
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Violation State' }),
  ).toBeVisible();
  await vulnerabilities.hover();
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Severity' }),
  ).toBeVisible();
});

test('keep the flat view after clearing the project name filter', async ({
  page,
}) => {
  const { project } = seed();
  await login(page);
  await page.goto('projects');
  const flatView = page.getByLabel('Show flat project view');
  await page.getByText('Show flat project view').click();
  await expect(flatView).toBeChecked();
  await projectSearch(page, project.name);
  await page
    .getByRole('button', { name: 'Clear Project Name', exact: true })
    .click();
  await expect(page).toHaveURL((url) => !url.searchParams.has('name_contains'));
  await expect(flatView).toBeEnabled();
  await expect(flatView).toBeChecked();
});

test('combine project filters and restore them from the URL', async ({
  page,
  api,
}) => {
  const prefix = uniqueName('e2e-filters');
  const version = uniqueName('version');
  const matching = `${prefix}-matching`;
  const wrongVersion = `${prefix}-other-version`;
  const wrongName = uniqueName('e2e-other-name');
  const inactive = `${prefix}-inactive`;
  for (const project of [
    { name: matching, version, active: true },
    { name: wrongVersion, version: uniqueName('other-version'), active: true },
    { name: wrongName, version, active: true },
    { name: inactive, version, active: false },
  ]) {
    await api.send('PUT', '/v1/project', project);
  }

  await login(page);
  await page.goto('projects');
  await projectSearch(page, prefix);
  await expect(
    page.getByRole('link', { name: matching, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: wrongVersion, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeHidden();
  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByRole('menuitem', { name: 'Version', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Version contains', exact: true })
    .fill(version);
  await page
    .getByRole('menu', { name: 'Version', exact: true })
    .getByRole('button', { name: 'Apply', exact: true })
    .click();
  await expect(page).toHaveURL(
    (url) =>
      url.searchParams.get('name_contains') === prefix &&
      url.searchParams.get('version_contains') === version,
  );
  await expect(page.getByRole('link', { name: new RegExp(prefix) })).toHaveText(
    [matching],
  );
  await expect(
    page.getByRole('link', { name: wrongName, exact: true }),
  ).toBeHidden();

  const filteredUrl = page.url();
  await page.goto('projects');
  await page.goto(filteredUrl);
  await expect(page.getByRole('link', { name: new RegExp(prefix) })).toHaveText(
    [matching],
  );
  await page.getByRole('button', { name: /^Project Name/ }).click();
  await expect(
    page.getByRole('textbox', { name: 'Project Name contains', exact: true }),
  ).toHaveValue(prefix);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /^Version/ }).click();
  await expect(
    page.getByRole('textbox', { name: 'Version contains', exact: true }),
  ).toHaveValue(version);
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'Clear Project Name', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: wrongName, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: matching, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: wrongVersion, exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: inactive, exact: true }),
  ).toBeHidden();
});

test('paginate filtered projects with backend page tokens and reset after clearing the filter', async ({
  page,
  api,
}) => {
  const prefix = uniqueName('e2e-pages');
  const names = Array.from(
    { length: 12 },
    (_, i) => `${prefix}-${String(i).padStart(2, '0')}`,
  );
  for (const name of names) {
    await api.send('PUT', '/v1/project', { name, active: true });
  }
  await login(page);
  await page.goto('projects');
  await projectSearch(page, prefix);
  const links = page.getByRole('link', { name: new RegExp(prefix) });
  const previous = page.getByRole('button', {
    name: 'Previous page',
    exact: true,
  });
  const next = page.getByRole('button', { name: 'Next page', exact: true });
  await expect(links).toHaveText(names.slice(0, 10));
  await expect(previous).toBeDisabled();
  const nextPage = page.waitForResponse((res) => {
    const url = new URL(res.url());
    return (
      url.pathname === '/api/v2/projects' &&
      url.searchParams.get('name_contains') === prefix &&
      !!url.searchParams.get('page_token')
    );
  });
  await next.click();
  expect((await (await nextPage).json()).items).toHaveLength(2);
  await expect(links).toHaveText(names.slice(10));
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(links).toHaveText(names.slice(0, 10));
  await next.click();
  await expect(links).toHaveText(names.slice(10));

  await page
    .getByRole('button', { name: 'Clear Project Name', exact: true })
    .click();
  await expect(page).toHaveURL((url) => !url.searchParams.has('name_contains'));
  await expect(previous).toBeDisabled();
  await projectSearch(page, prefix);
  await expect(links).toHaveText(names.slice(0, 10));
});

test('filter inactive descendants by an inactive ancestor', async ({
  page,
  api,
}) => {
  const parent = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-inactive-ancestor'),
    active: true,
  });
  const child = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-inactive-child'),
    parent: { uuid: parent.uuid },
    active: false,
  });
  await api.send('POST', '/v1/project', { ...parent, active: false });
  await login(page);
  await page.goto('projects?state=INACTIVE');
  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByRole('menuitem', { name: 'Ancestor', exact: true }).click();
  const menu = page.getByRole('menu', { name: 'Ancestor', exact: true });
  await menu.getByRole('textbox').fill(parent.name);
  await menu.getByRole('radio', { name: parent.name, exact: true }).check();
  await menu.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(
    page.getByRole('link', { name: child.name, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: parent.name, exact: true }),
  ).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole('link', { name: child.name, exact: true }),
  ).toBeVisible();
});

test('restore the scroll position of the project list when going back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await login(page);
  await page.goto('projects');
  const link = page.getByRole('row').last().getByRole('link').first();
  await link.scrollIntoViewIfNeeded();
  const scrolled = await page.evaluate(() => window.scrollY);
  expect(scrolled).toBeGreaterThan(0);
  let releaseMetrics;
  const pendingMetrics = new Promise((resolve) => {
    releaseMetrics = resolve;
  });
  let metricsHandled;
  const handledMetrics = new Promise((resolve) => {
    metricsHandled = resolve;
  });
  const metricsRequest = page.waitForRequest(
    '**/api/v1/metrics/project/*/days/*',
  );
  await page.route('**/api/v1/metrics/project/*/days/*', async (route) => {
    const response = await route.fetch();
    await pendingMetrics;
    await route.fulfill({ response });
    metricsHandled();
  });
  await link.click();
  await expect(page).toHaveURL(/\/projects\/[^/]+$/);
  await metricsRequest;
  await page.goBack();
  releaseMetrics();
  await handledMetrics;
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrolled);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('expand and collapse a parent project in the project tree', async ({
  page,
  api,
}) => {
  const parent = await api.send('PUT', '/v1/project', {
    name: `zzz-${uniqueName('e2e-parent')}`,
  });
  const child = uniqueName('e2e-child');
  await api.send('PUT', '/v1/project', {
    name: child,
    parent: { uuid: parent.uuid },
  });
  // Newest first, so the parent lands on the first page.
  await page.addInitScript(() => {
    localStorage.setItem('ProjectListSortName', 'name');
    localStorage.setItem('ProjectListSortOrder', 'desc');
  });

  await login(page);
  await page.goto('projects');
  const parentRow = page.getByRole('row').filter({ hasText: parent.name });
  const childLink = page.getByRole('link', { name: child });
  await parentRow.getByRole('cell').nth(1).click();
  await expect(childLink).toBeVisible();
  await parentRow.getByRole('cell').nth(1).click();
  await expect(childLink).toBeHidden();
});
