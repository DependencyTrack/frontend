import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('show the argument of a workflow run event', async ({ page }) => {
  await login(page);
  await page.goto(`admin/workflows/runs/${seed().workflowRunId}`);
  await page.getByRole('link', { name: 'Argument' }).first().click();
  await expect(page.getByText('"protoContent"')).toBeVisible();
});
