import { seed, uniqueName } from '../api.mjs';
import {
  test,
  expect,
  login,
  addFilter,
  chooseProjectView,
  expandProject,
  pickOption,
  projectSearch,
} from '../test.mjs';

test('search the project list and open a project', async ({ page }) => {
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

test('show the metrics of a project in tooltips', async ({ page, api }) => {
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

  const {
    items: [{ metrics }],
  } = await api.get(
    `/v2/projects?name_contains=${project.name}&expand=metrics`,
  );
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Policy Violations' }).uncheck();
  await page.getByRole('checkbox', { name: 'Vulnerabilities' }).uncheck();
  await page.getByRole('checkbox', { name: 'Components' }).check();
  await page.keyboard.press('Escape');
  const headers = (await page.getByRole('columnheader').allInnerTexts()).map(
    (h) => h.trim(),
  );
  const cells = row.getByRole('cell');
  await expect(cells.nth(headers.indexOf('Components'))).toHaveText(
    String(metrics.components),
  );
  await expect(cells.nth(headers.indexOf('KEV'))).toHaveText(
    String(metrics.kev),
  );
});

test('keep the flat view after clearing the project name filter', async ({
  page,
}) => {
  const { project } = seed();
  await login(page);
  await page.goto('projects');
  await chooseProjectView(page, 'Flat');
  const flat = page.getByRole('button', { name: 'Flat', pressed: true });
  await expect(flat).toBeVisible();
  await projectSearch(page, project.name);
  await page.getByRole('button', { name: 'Clear Name', exact: true }).click();
  await expect(page).toHaveURL((url) => !url.searchParams.has('name_contains'));
  await expect(page.getByRole('button', { name: 'Tree' })).toBeEnabled();
  await expect(flat).toBeVisible();
});

test('combine project filters from the URL', async ({ page, api }) => {
  const prefix = uniqueName('e2e-filters');
  const version = uniqueName('version');
  const matching = `${prefix}-matching`;
  await api.send('PUT', '/v1/project', { name: matching, version });
  await api.send('PUT', '/v1/project', {
    name: `${prefix}-other-version`,
    version: uniqueName('version'),
  });
  await login(page);
  await page.goto(
    `projects?name_contains=${prefix}&version_contains=${version}`,
  );
  await expect(page.getByRole('link', { name: new RegExp(prefix) })).toHaveText(
    [matching],
  );
});

test('paginate filtered projects and reset after clearing the filter', async ({
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
  await next.click();
  await expect(links).toHaveText(names.slice(10));
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(links).toHaveText(names.slice(0, 10));
  await next.click();
  await page.getByRole('button', { name: 'Clear Name', exact: true }).click();
  await expect(page).toHaveURL((url) => !url.searchParams.has('name_contains'));
  await expect(previous).toBeDisabled();
});

test('filter by a specific, inactive version of an ancestor', async ({
  page,
  api,
}) => {
  const name = uniqueName('e2e-ancestor');
  await api.send('PUT', '/v1/project', { name, version: '1' });
  const parent = await api.send('PUT', '/v1/project', { name, version: '2' });
  const child = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-ancestor-child'),
    parent: { uuid: parent.uuid },
    active: false,
  });
  await api.send('POST', '/v1/project', { ...parent, active: false });
  await login(page);
  await page.goto('projects?show_inactive=true');
  await addFilter(page, 'Ancestor');
  await expect(page.getByRole('option').first()).toBeInViewport({ ratio: 1 });
  await pickOption(page, 'Ancestor', `${name} : 2`);
  const childLink = page.getByRole('link', { name: child.name, exact: true });
  await expect(childLink).toBeVisible();
  await page.reload();
  await expect(childLink).toBeVisible();
  await expect(
    page.getByRole('button', { name: `Ancestor = ${name} : 2` }),
  ).toBeVisible();
});

test('sort by name when the saved sort column is no longer sortable', async ({
  page,
}) => {
  await login(page);
  await page.evaluate(() =>
    localStorage.setItem('ProjectListSortName', 'version'),
  );
  const loaded = page.waitForResponse((res) =>
    res.url().includes('/api/v2/projects?'),
  );
  await page.goto('projects');
  expect(new URL((await loaded).url()).searchParams.get('sort_by')).toBe(
    'name',
  );
});

test('load more children of a parent in the project tree', async ({
  page,
  api,
  problems,
}) => {
  problems.allow(/^GET \/api\/v2\/projects\?.*page_token=.* 503$/);
  // Sorts before letters and digits, so the parent lands on the first page.
  const parent = await api.send('PUT', '/v1/project', {
    name: `!${uniqueName('e2e-many-children')}`,
  });
  try {
    const children = await Promise.all(
      Array.from({ length: 26 }, (_, i) =>
        api.send('PUT', '/v1/project', {
          name: `${parent.name}-${String(i + 1).padStart(2, '0')}`,
          parent: { uuid: parent.uuid },
        }),
      ),
    );
    let failNext = true;
    await page.route('**/api/v2/projects?*page_token=*', (route) => {
      if (!failNext) return route.continue();
      failNext = false;
      return route.fulfill({ status: 503 });
    });
    await login(page);
    await page.goto('projects');
    const link = (project) =>
      page.getByRole('link', { name: project.name, exact: true });
    await expandProject(page, parent.name);
    await expect(link(children[24])).toBeVisible();
    await expect(link(children[25])).toBeHidden();
    const showMore = page.getByRole('button', { name: 'Show more' });
    const failed = page.waitForResponse((res) => res.status() === 503);
    await showMore.click();
    await failed;
    await showMore.click();
    await expect(link(children[25])).toBeVisible();
    await expect(showMore).toBeHidden();
  } finally {
    await api.send('DELETE', `/v1/project/${parent.uuid}`);
  }
});

test('drop an ancestor filter only when its project no longer exists', async ({
  page,
  problems,
}) => {
  problems.allow(/^GET \/api\/v1\/project\/[0-9a-f-]+ (404|503)$/);
  problems.allow(/^console\.error: Failed to load project: .* (404|503)$/);
  const { project } = seed();
  await page.route(`**/api/v1/project/${project.uuid}`, (route) =>
    route.fulfill({ status: 503 }),
  );
  await login(page);
  const failed = page.waitForResponse((res) => res.status() === 503);
  await page.goto(`projects?ancestor_uuid=${project.uuid}`);
  await failed;
  await expect(
    page.getByRole('button', { name: `Ancestor = ${project.uuid}` }),
  ).toBeVisible();
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('ancestor_uuid') === project.uuid,
  );

  await page.goto(`projects?ancestor_uuid=${crypto.randomUUID()}`);
  await expect(page).toHaveURL((url) => !url.searchParams.has('ancestor_uuid'));
  await expect(page.getByRole('button', { name: /^Ancestor =/ })).toHaveCount(
    0,
  );
});

test('switch to the flat view for filters the tree would hide children for', async ({
  page,
}) => {
  await login(page);
  await page.goto('projects');
  const tree = page.getByRole('button', { name: 'Tree' });
  await chooseProjectView(page, 'Tree');
  await expect(tree).toHaveAttribute('aria-pressed', 'true');
  const reason = "Tree view isn't available while filters are applied";
  await expect(page.getByText(reason)).toHaveCount(0);
  await page.goto('projects?show_inactive=true');
  await expect(tree).toBeEnabled();
  await page.goto('projects?is_latest=true');
  await expect(tree).toBeDisabled();
  await tree.focus();
  await expect(tree).toBeFocused();
  await expect(tree).toHaveAccessibleDescription(reason);
  await page.keyboard.press('Space');
  await expect(tree).toHaveAttribute('aria-pressed', 'false');
  const flat = page.getByRole('button', { name: 'Flat', pressed: true });
  await expect(flat).toBeVisible();
  await chooseProjectView(page, 'Flat');
  await expect(flat).toBeVisible();
  await page.getByRole('button', { name: 'Clear Only latest' }).click();
  await expect(tree).toHaveAttribute('aria-pressed', 'true');
});

test('expand a child project in the collection projects tab', async ({
  page,
  api,
}) => {
  const collection = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-collection'),
    collectionLogic: 'AGGREGATE_DIRECT_CHILDREN',
  });
  const child = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-collection-child'),
    parent: { uuid: collection.uuid },
  });
  const grandchild = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-collection-grandchild'),
    parent: { uuid: child.uuid },
  });
  await login(page);
  await page.goto(
    `projects/${collection.uuid}/collectionprojects?name_contains=e2e-collection`,
  );
  await expandProject(page, child.name);
  await expect(
    page.getByRole('link', { name: grandchild.name, exact: true }),
  ).toBeVisible();
});

test('filter projects by tags', async ({ page, api }) => {
  const prefix = uniqueName('e2e-tagged');
  const tag = uniqueName('e2e-tag');
  await api.send('PUT', '/v1/project', {
    name: `${prefix}-tagged`,
    tags: [{ name: tag }],
  });
  await api.send('PUT', '/v1/project', { name: `${prefix}-untagged` });
  const untagged = page.getByRole('link', {
    name: `${prefix}-untagged`,
    exact: true,
  });
  await login(page);
  await page.goto(`projects?name_contains=${prefix}`);
  await expect(untagged).toBeVisible();
  await addFilter(page, 'Tags');
  const tags = page.getByRole('textbox', { name: 'Tags' });
  await tags.fill(tag);
  await tags.press('Enter');
  await expect(
    page.getByRole('link', { name: `${prefix}-tagged`, exact: true }),
  ).toBeVisible();
  await expect(untagged).toBeHidden();
});

test('show inactive and only the latest projects, then clear all', async ({
  page,
  api,
}) => {
  const prefix = uniqueName('e2e-state');
  const active = `${prefix}-active`;
  const inactive = `${prefix}-inactive`;
  await api.send('PUT', '/v1/project', { name: active, version: '1' });
  await api.send('PUT', '/v1/project', {
    name: active,
    version: '2',
    isLatest: true,
  });
  await api.send('PUT', '/v1/project', { name: inactive, active: false });
  await login(page);
  await page.goto(`projects?name_contains=${prefix}`);
  const activeLinks = page.getByRole('link', { name: active, exact: true });
  const inactiveLink = page.getByRole('link', { name: inactive, exact: true });
  await expect(activeLinks).toHaveCount(2);
  await expect(inactiveLink).toBeHidden();

  await addFilter(page, 'Show inactive');
  await expect(inactiveLink).toBeVisible();
  await page.reload();
  await expect(inactiveLink).toBeVisible();

  await addFilter(page, 'Only latest');
  await expect(activeLinks).toHaveCount(1);
  await page.reload();
  await expect(activeLinks).toHaveCount(1);
  await expect(
    page
      .getByRole('row')
      .filter({ has: activeLinks })
      .getByRole('cell', { name: '2', exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page).toHaveURL((url) => url.search === '');
  await expect(
    page.getByRole('button', { name: 'Clear Show inactive' }),
  ).toBeHidden();
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
  await link.click();
  await expect(page).toHaveURL(/\/projects\/[^/]+$/);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrolled);
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

test('select all options of a filter', async ({ page }) => {
  await login(page);
  await page.goto('projects');
  await addFilter(page, 'Classifier');
  await page.getByText('Select all', { exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Library' })).toBeChecked();
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/projects'));
});
