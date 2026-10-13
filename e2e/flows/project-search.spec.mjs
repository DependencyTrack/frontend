import { seed } from '../api.mjs';
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
  const bars = page
    .getByRole('row')
    .filter({ hasText: project.name })
    .getByRole('progressbar')
    .filter({ visible: true });
  await bars.first().hover();
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Violation State' }),
  ).toBeVisible();
  await bars.last().hover();
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
