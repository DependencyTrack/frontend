import { seed, uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

const checkNames = (page) =>
  page
    .getByRole('table', { name: 'Scorecard' })
    .getByRole('row')
    .getByRole('button')
    .allTextContents();

test('show the package health of a component', async ({ page }) => {
  await login(page);
  await page.goto(`components/${seed().healthComponentUuid}/health`);
  await expect(
    page.getByRole('tab', { name: 'Health 4.9', selected: true }),
  ).toBeVisible();
  const health = page.getByRole('tabpanel', { name: /Health/ });
  await expect(
    health.getByRole('heading', { name: 'Component Health' }),
  ).toBeVisible();
  await expect(
    health.getByRole('img', { name: 'OpenSSF Scorecard: 4.9 out of 10' }),
  ).toBeVisible();
  await expect(health.getByText('3 Oct 2026')).toBeVisible();
  await expect(health.getByText('Not archived')).toBeVisible();
  await expect(health.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/FasterXML/jackson-core',
  );
  await expect(health.getByRole('definition').nth(4)).toHaveText(
    '1,727.9 days',
  );

  expect((await checkNames(page)).map((name) => name.trim())).toEqual([
    'Branch Protection',
    'Code Review',
    'Dangerous Workflow',
    'Maintained',
    'License',
    'Signed Releases',
  ]);
  await health
    .getByRole('combobox', { name: 'Sort Scorecard Checks' })
    .selectOption('Highest Risks First');
  expect((await checkNames(page)).map((name) => name.trim())).toEqual([
    'Dangerous Workflow',
    'Branch Protection',
    'Code Review',
    'Maintained',
    'Signed Releases',
    'License',
  ]);
});

test('open the details of a scorecard check', async ({ page }) => {
  await login(page);
  await page.goto(`components/${seed().healthComponentUuid}/health`);
  const check = page.getByRole('button', { name: 'Branch Protection' });
  await check.click();
  const dialog = page.getByRole('dialog', { name: /Branch Protection/ });
  await expect(dialog).toContainText('0 / 10');
  await expect(dialog).toContainText(
    'branch protection not enabled on development/release branches',
  );
  await expect(dialog).toContainText(
    "Warn: branch protection not enabled for branch 'master'",
  );
  await expect(
    dialog.getByRole('link', { name: 'Documentation' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/ossf/scorecard/blob/main/docs/checks.md#branch-protection',
  );
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
  await expect(check).toBeFocused();
});

test('show that a component has no package health', async ({ page, api }) => {
  const project = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-health'),
  });
  const name = uniqueName('component');
  const { uuid } = await api.send(
    'PUT',
    `/v1/component/project/${project.uuid}`,
    {
      name,
      version: '1.0.0',
      purl: `pkg:generic/${name}@1.0.0`,
      classifier: 'LIBRARY',
    },
  );
  await login(page);
  await page.goto(`components/${uuid}/health`);
  await expect(
    page.getByRole('tab', { name: 'Health No score', selected: true }),
  ).toBeVisible();
  await expect(page.getByText('No health metadata available.')).toBeVisible();
});

test('sort project components by their scorecard score', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  const score = page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .getByText('4.9', { exact: true });
  await expect(score).toBeVisible();
  await score.hover();
  await expect(page.getByRole('tooltip')).toHaveText(
    'Scorecard score applies to the current repository state, not the state when this version was released',
  );

  // Components without a score sort as the lowest, so the scored one comes first when descending.
  for (const direction of ['ASC', 'DESC']) {
    const sorted = page.waitForResponse((res) => {
      const params = new URL(res.url()).searchParams;
      return (
        params.get('sort_by') === 'scorecard_score' &&
        params.get('sort_direction') === direction
      );
    });
    await page.getByRole('columnheader', { name: 'Scorecard' }).click();
    await (await sorted).finished();
  }
  await expect(page.getByRole('row').nth(1)).toContainText('jackson-core');
});

test('turn off package health resolution', async ({ page }) => {
  await login(page);
  await page.goto('admin/configuration/packageHealth');
  const enabled = page.getByLabel('Enable package health metadata resolution');
  await expect(enabled).toBeChecked();
  // Saving for real would hide package health from tests running in parallel.
  const saved = new Promise((resolve) =>
    page.route('**/api/v1/configProperty/aggregate', async (route) => {
      resolve(route.request().postDataJSON());
      await route.fulfill({ json: [] });
    }),
  );
  await enabled.uncheck();
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Configuration saved')).toBeVisible();
  expect(await saved).toEqual([
    {
      groupName: 'package-health',
      propertyName: 'enabled',
      propertyValue: false,
    },
  ]);
});
