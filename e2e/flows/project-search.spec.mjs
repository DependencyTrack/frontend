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
