import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('project dependency graph renders', async ({ page }) => {
  const { project, componentUuid } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph/${componentUuid}`);
  const graph = page.getByRole('tabpanel');
  await expect(graph.getByText(project.name)).toBeVisible();
  await expect(graph.getByText('jackson-databind')).toBeVisible();
});
