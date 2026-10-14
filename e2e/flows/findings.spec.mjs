import { seed } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

test('open a project component and finding', async ({ page }) => {
  const { project, vulnId } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await expect(
    page
      .getByRole('tabpanel')
      .getByRole('row')
      .filter({ hasText: 'jackson-core' }),
  ).toBeVisible();

  await page.getByRole('tab', { name: /Audit Vulnerabilities/ }).click();
  await search(page, vulnId);
  await page
    .getByRole('tabpanel')
    .getByRole('row')
    .filter({ hasText: vulnId })
    .getByRole('link', { name: 'jackson-databind' })
    .click();
  await expect(page).toHaveTitle(/jackson-databind/);
  await expect(
    page.getByRole('heading', { name: 'Component Vulnerabilities' }),
  ).toBeVisible();
});

test('audit a finding', async ({ page, problems }) => {
  problems.allow(/^GET \/api\/v1\/analysis\?.* 404$/);
  const { project, vulnUuid } = seed();
  await login(page);
  // The deep link expands the finding; the row's expand icon has no accessible name.
  await page.goto(`projects/${project.uuid}/findings/${vulnUuid}`);

  const auditTrail = page.getByLabel('Audit Trail');
  await page
    .getByRole('combobox')
    .filter({ has: page.getByRole('option', { name: 'In Triage' }) })
    .selectOption({ label: 'In Triage' });
  await expect(auditTrail).toHaveValue(/IN_TRIAGE/);
  await page.getByLabel('Comment', { exact: true }).fill('Looks exploitable');
  await page.getByRole('button', { name: 'Add Comment' }).click();
  await expect(auditTrail).toHaveValue(/Looks exploitable/);

  // Leaves the shared finding unsuppressed for the other tests.
  await page.route('**/api/v1/analysis', (route) =>
    route.fulfill({ json: route.request().postDataJSON() }),
  );
  const suppressed = page.getByRole('checkbox', {
    name: 'Suppressed',
    exact: true,
  });
  const update = () => page.waitForRequest('**/api/v1/analysis');
  let request = update();
  await suppressed.check();
  expect((await request).postDataJSON().isSuppressed).toBe(true);
  request = update();
  await suppressed.uncheck();
  expect((await request).postDataJSON().isSuppressed).toBe(false);
});

test('reset a findings sort the API no longer supports', async ({
  page,
  problems,
}) => {
  problems.allow(/^GET \/api\/v1\/finding\/project\/.* 400$/);
  await login(page);
  await page.evaluate(() =>
    localStorage.setItem('ProjectFindingsSortName', 'unknown'),
  );
  await page.goto(`projects/${seed().project.uuid}/findings`);
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Sorting by "unknown" is no longer supported.' }),
  ).toBeVisible();
});
