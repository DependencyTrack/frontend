import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('delete a custom license after confirming', async ({ page, api }) => {
  const licenseId = uniqueName('E2E-License');
  await api.send('PUT', '/v1/license', { licenseId, name: licenseId });
  await login(page);
  await page.goto(`licenses/${licenseId}`);
  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Delete' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(page.getByText('Custom License Deleted')).toBeVisible();
  await expect(page).toHaveURL(/\/licenses$/);
});
