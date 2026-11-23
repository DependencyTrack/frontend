import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('show the occurrences of a component', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Occurrences' }).check();
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .getByRole('button', { name: '1', exact: true })
    .click();
  const modal = page.getByRole('dialog', {
    name: 'Occurrences of component jackson-core',
  });
  await expect(modal).toContainText('lib/jackson-core-2.13.2.jar');
});

test('show the vulnerabilities of a component by severity', async ({
  page,
}) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  const bar = page
    .getByRole('row')
    .filter({ hasText: 'jackson-databind' })
    .getByRole('progressbar', { name: 'Severity' })
    .filter({ visible: true })
    .first();
  await expect(bar).toHaveAttribute(
    'aria-valuetext',
    /^Critical: \d+, High: \d+, Medium: \d+, Low: \d+, Unassigned: \d+$/,
  );
  await bar.hover();
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Severity' }),
  ).toBeVisible();
});

test('verify the hashes of a component', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Integrity' }).check();
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .getByRole('button', { name: 'Hashes match' })
    .click();
  const modal = page.getByRole('dialog', { name: 'Hash verification' });
  await expect(modal).toContainText('0a6a0e0620d51833feffc67bccb51937b2345763');
});

test('show a latest version with a quote in its tooltip', async ({ page }) => {
  const latest = '99.0" onmouseover="alert(1)';
  await page.route('**/api/v2/projects/*/components?*', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    for (const item of json.items) {
      item.package_metadata = { latest_version: latest };
    }
    await route.fulfill({ response, json });
  });
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .locator('.fa-exclamation-triangle')
    .hover();
  await expect(page.getByRole('tooltip')).toContainText(latest);
});

test('link a component to the dependency graph', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'jackson-core' })
      .getByRole('link')
      .filter({ has: page.locator('.fa-sitemap') }),
  ).toHaveAttribute('href', /\/dependencyGraph\//);
});

test('load licenses only when adding a component', async ({ page }) => {
  const { project } = seed();
  const licenses = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/v1/license/concise')) licenses.push(req);
  });
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await expect(
    page.getByRole('button', { name: 'Add', exact: true }),
  ).toBeVisible();
  expect(licenses).toEqual([]);

  const loaded = page.waitForRequest((req) =>
    req.url().includes('/api/v1/license/concise'),
  );
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await loaded;
  await expect(
    page.getByRole('dialog', { name: 'Component Details' }),
  ).toBeVisible();
});
