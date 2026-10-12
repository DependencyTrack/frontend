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
