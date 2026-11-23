import { uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

test('show the projects of a tag', async ({ page, api }) => {
  const tag = uniqueName('e2e-tag');
  const project = uniqueName('e2e-tagged');
  await api.send('PUT', '/v1/project', {
    name: project,
    tags: [{ name: tag }],
  });

  await login(page);
  await page.goto('tags');
  await search(page, tag);
  await page
    .getByRole('row')
    .filter({ hasText: tag })
    .getByRole('button', { name: '1', exact: true })
    .click();
  const modal = page.getByRole('dialog', {
    name: `Projects tagged with ${tag}`,
  });
  await expect(modal).toContainText(project);
});

test('list a tag with special characters', async ({ page, api }) => {
  const tag = `${uniqueName('e2e-tag')}"<>`;
  await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-tagged'),
    tags: [{ name: tag }],
  });

  await login(page);
  await page.goto('tags');
  await search(page, tag);
  await expect(page.getByRole('row').filter({ hasText: tag })).toBeVisible();
});
