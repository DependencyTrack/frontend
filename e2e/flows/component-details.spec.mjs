import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

async function createComponent(api) {
  const project = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-component'),
  });
  const name = uniqueName('component');
  return api.send('PUT', `/v1/component/project/${project.uuid}`, {
    name,
    version: '1.0.0',
    purl: `pkg:generic/${name}@1.0.0`,
    classifier: 'LIBRARY',
  });
}

test('delete selected component properties after confirming', async ({
  page,
  api,
}) => {
  const { uuid } = await createComponent(api);
  const propertyName = uniqueName('property');
  await api.send('PUT', `/v1/component/${uuid}/property`, {
    groupName: 'e2e',
    propertyName,
    propertyValue: 'value',
    propertyType: 'STRING',
  });
  await login(page);
  await page.goto(`components/${uuid}`);
  await page.getByRole('button', { name: 'View Details' }).click();
  await page
    .getByRole('dialog', { name: 'Component Details' })
    .getByRole('button', { name: 'Properties' })
    .click();
  const properties = page.getByRole('dialog', { name: 'Component Properties' });
  await properties
    .getByRole('row', { name: propertyName })
    .getByRole('checkbox')
    .check();
  await properties.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Delete' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(page.getByText('Property deleted')).toBeVisible();
});

test('copy the package URL of a component', async ({ page, context, api }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { uuid, purl } = await createComponent(api);
  await login(page);
  await page.goto(`components/${uuid}`);
  await page.getByRole('button', { name: 'View Details' }).click();
  await page
    .getByRole('dialog', { name: 'Component Details' })
    .getByRole('button', { name: 'Copy Package URL' })
    .click();
  await expect(page.getByText('Copied to clipboard')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(purl);
});
