import { seed } from '../api.mjs';
import { test, expect, login, chooseRadio, auditSearch } from '../test.mjs';

test('audit a policy violation', async ({ page }) => {
  const { project, violationPolicy } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/policyViolations`);
  // Policies that other tests leave behind add rows for the same component.
  const row = page.getByRole('row').filter({ hasText: violationPolicy });
  await row.press('Enter');

  const drawer = page.getByRole('dialog', { name: /jackson-databind/ });
  await chooseRadio(drawer, 'Approved');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(row).toContainText('Approved');
  await drawer.getByRole('tab', { name: 'History' }).click();
  const history = drawer.getByRole('tabpanel', { name: 'History' });
  await expect(history).toContainText('APPROVED');
  await history.getByLabel('Comment').fill('Accepted risk');
  await history.getByRole('button', { name: 'Add Comment' }).click();
  await expect(history).toContainText('Accepted risk');

  // Leaves the shared violation unsuppressed, so other tests still list it.
  await page.route('**/api/v1/violation/analysis', (route) =>
    route.fulfill({ json: route.request().postDataJSON() }),
  );
  await drawer.getByRole('tab', { name: 'Analysis' }).click();
  await drawer.getByRole('checkbox', { name: 'Suppressed' }).check();
  const saved = page.waitForRequest('**/api/v1/violation/analysis');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await saved).postDataJSON().isSuppressed).toBe(true);
});

test('open a policy violation from the policy violation audit', async ({
  page,
}) => {
  const { project, violationMessage, violationPolicy } = seed();
  await login(page);
  await page.goto('policyViolationAudit');
  await auditSearch(page, project.name);
  await page
    .getByRole('row')
    .filter({ hasText: project.name })
    .filter({ hasText: violationPolicy })
    .press('Enter');
  const drawer = page.getByRole('dialog', { name: /jackson-databind/ });
  await expect(
    drawer.getByRole('tabpanel', { name: 'Analysis' }),
  ).toContainText(violationMessage);
});

test('keep the analysis of a removed policy violation read-only', async ({
  page,
  problems,
}) => {
  problems.allow(/^GET \/api\/v1\/violation\/analysis\?.* 404$/);
  await page.route('**/api/v1/violation/analysis?*', (route) =>
    route.fulfill({ status: 404 }),
  );
  const { project, violationPolicy } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/policyViolations`);
  await page
    .getByRole('row')
    .filter({ hasText: violationPolicy })
    .press('Enter');
  const drawer = page.getByRole('dialog', { name: /jackson-databind/ });
  await expect(
    drawer.getByText('Could not perform the requested action'),
  ).toBeVisible();
  await expect(
    drawer.getByRole('checkbox', { name: 'Suppressed' }),
  ).toBeDisabled();
});
