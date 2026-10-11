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
