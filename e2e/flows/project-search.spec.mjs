import { seed, uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

test('search the project list and open a project', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto('projects');
  await search(page, project.name);
  // The list puts the search into the URL; leaving before that finishes makes vue-router 3 throw.
  await expect(page).toHaveURL(/[?&]searchText=/);
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
  await search(page, project.name);
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

test('keep the flat view after clearing a search', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto('projects');
  const flatView = page.getByLabel('Show flat project view');
  await page.getByText('Show flat project view').click();
  await expect(flatView).toBeChecked();
  await search(page, project.name);
  await page.getByRole('searchbox', { name: 'Search' }).clear();
  await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
  await expect(flatView).toBeEnabled();
  await expect(flatView).toBeChecked();
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
