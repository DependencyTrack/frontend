import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('audit a policy violation', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/policyViolations`);
  // The row's expand icon has no accessible name.
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-databind' })
    .locator('.detail-icon')
    .click();

  const auditTrail = page.getByLabel('Audit Trail');
  await page
    .getByRole('combobox')
    .filter({ has: page.getByRole('option', { name: 'Approved' }) })
    .selectOption({ label: 'Approved' });
  await expect(auditTrail).toHaveValue(/APPROVED/);
  await page.getByLabel('Comment', { exact: true }).fill('Accepted risk');
  await page.getByRole('button', { name: 'Add Comment' }).click();
  await expect(auditTrail).toHaveValue(/Accepted risk/);
});
