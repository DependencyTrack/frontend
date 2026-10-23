import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('project dependency graph renders', async ({ page }) => {
  const { project, componentUuid } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph/${componentUuid}`);
  const graph = page.getByRole('tabpanel');
  await expect(graph.getByText(project.name)).toBeVisible();
  await expect(
    graph.getByRole('link', {
      name: 'com.fasterxml.jackson.core/jackson-databind 2.13.2.2',
    }),
  ).toBeVisible();
});

test('dependency graph expands nodes and links to components', async ({
  page,
}) => {
  const { project, componentUuid } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/dependencyGraph`);
  const graph = page.getByRole('tabpanel');
  await graph
    .getByRole('button', {
      name: 'com.fasterxml.jackson.core/jackson-databind 2.13.2.2',
    })
    .click();
  await expect(
    graph.getByRole('link', {
      name: 'com.fasterxml.jackson.core/jackson-core 2.13.2',
    }),
  ).toBeVisible();
  await expect(
    graph.getByRole('link', {
      name: 'com.fasterxml.jackson.core/jackson-databind 2.13.2.2',
    }),
  ).toHaveAttribute('href', `/components/${componentUuid}`);
});

test('dependency graph keeps parents in view while scrolling their children', async ({
  page,
}) => {
  const { project } = seed();
  await login(page);
  await page.setViewportSize({ width: 1280, height: 120 });
  await page.goto(`projects/${project.uuid}/dependencyGraph`);
  const graph = page.getByRole('tabpanel');
  await graph
    .getByRole('button', { name: 'jackson-databind 2.13.2.2' })
    .click();
  await expect(graph.getByRole('link', { name: 'jackson-core' })).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  for (const parent of [
    graph.getByText(project.name),
    graph.getByRole('link', { name: 'jackson-databind' }),
  ]) {
    expect((await parent.boundingBox()).y).toBeGreaterThanOrEqual(0);
  }
});
