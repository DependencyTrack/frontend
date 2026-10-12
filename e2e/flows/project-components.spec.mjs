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

test('show the vulnerabilities of a component in a tooltip', async ({
  page,
}) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-databind' })
    .getByRole('progressbar')
    .filter({ visible: true })
    .first()
    .hover();
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
