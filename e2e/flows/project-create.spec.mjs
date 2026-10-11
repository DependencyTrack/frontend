import { seed, uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('create a project with tags and a parent', async ({ page, api }) => {
  const parent = seed().project;
  const name = uniqueName('e2e-created');
  const tag = uniqueName('tag');
  await login(page);
  await page.goto('projects');
  await page.getByRole('button', { name: 'Create Project' }).click();

  const modal = page.getByRole('dialog', { name: 'Create Project' });
  await modal.getByLabel('Project Name').fill(name);
  await modal.getByLabel('Version', { exact: true }).fill('1.0.0');
  await modal.getByText('Type to search parent').click();
  await page.keyboard.type(parent.name);
  await modal.getByRole('option', { name: new RegExp(parent.name) }).click();
  await modal.getByPlaceholder('Add Tag').fill(tag);
  await modal.getByPlaceholder('Add Tag').press('Enter');
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Project created')).toBeVisible();
  await expect(modal).toBeHidden();

  await expect(page).toHaveTitle(new RegExp(name));
  await expect(page.getByRole('main').getByText(tag)).toBeVisible();

  // The project page doesn't show the parent.
  const uuid = new URL(page.url()).pathname.split('/').pop();
  const created = await api.get(`/v1/project/${uuid}`);
  expect(created.parent?.uuid).toBe(parent.uuid);
});
