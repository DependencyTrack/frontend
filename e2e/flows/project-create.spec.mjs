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
  await modal.getByText('Parent', { exact: true }).click();
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

test('pick a parent in a short window', async ({ page }) => {
  const parent = seed().project;
  // Leaves about 10px below the picker for its list.
  await page.setViewportSize({ width: 1280, height: 510 });
  await login(page);
  await page.goto('projects');
  await page.getByRole('button', { name: 'Create Project' }).click();

  const modal = page.getByRole('dialog', { name: 'Create Project' });
  await modal.getByText('Parent', { exact: true }).click();
  await page.keyboard.type(parent.name);
  const option = modal.getByRole('option', { name: new RegExp(parent.name) });
  await expect(option).toBeInViewport({ ratio: 1 });
  await option.click();
  await expect(
    modal.getByRole('combobox').filter({ hasText: parent.name }),
  ).toBeVisible();
});

test('create a collection project of the children with a tag', async ({
  page,
  api,
  problems,
}) => {
  // ProjectList's table callbacks still run after creating the project navigates away from it.
  problems.allow(/^pageerror: .*'hideLoading'/);
  const tag = uniqueName('tag');
  await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-tagged'),
    tags: [{ name: tag }],
  });
  const name = uniqueName('e2e-collection');
  await login(page);
  await page.goto('projects');
  await page.getByRole('button', { name: 'Create Project' }).click();

  const modal = page.getByRole('dialog', { name: 'Create Project' });
  await modal.getByLabel('Project Name').fill(name);
  await modal.getByText('Collection project').click();
  await modal
    .getByLabel('Project Collection Logic')
    .selectOption({ label: 'Aggregate direct children with tag' });
  const input = modal.getByPlaceholder(
    'Aggregate data of children with this tag',
  );
  await input.fill(tag.slice(0, -1));
  // The browser draws the suggestions, so they're only in the DOM as datalist options.
  await expect(
    modal.locator(`#input-collectionTags-suggestions option[value="${tag}"]`),
  ).toBeAttached();
  // Playwright can't open the browser's dropdown, so do what picking a suggestion does.
  await input.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(
      new InputEvent('input', { inputType: 'insertReplacementText' }),
    );
  }, tag);
  await expect(
    modal.getByRole('button', { name: `Remove ${tag}` }),
  ).toBeVisible();
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Project created')).toBeVisible();
  await expect(page).toHaveTitle(new RegExp(name));

  const uuid = new URL(page.url()).pathname.split('/').pop();
  const created = await api.get(`/v1/project/${uuid}`);
  expect(created.collectionTag?.name).toBe(tag);
});
