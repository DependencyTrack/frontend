import { APP_URL, seed } from '../api.mjs';
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

function violationLink({ project, componentUuid, violationUuid }) {
  return `projects/${project.uuid}/policyViolations?component=${componentUuid}&violation=${violationUuid}`;
}

async function openSeededViolation(page) {
  const { project, violationPolicy } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/policyViolations`);
  await page
    .getByRole('row')
    .filter({ hasText: violationPolicy })
    .press('Enter');
  return page.getByRole('dialog', { name: /jackson-databind/ });
}

test('copy the link to a policy violation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const drawer = await openSeededViolation(page);
  await drawer.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText('Copied to clipboard')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${APP_URL}/${violationLink(seed())}`,
  );
});

test('show the open policy violation in the address bar', async ({ page }) => {
  const { project } = seed();
  const drawer = await openSeededViolation(page);
  await expect(page).toHaveURL(violationLink(seed()));
  await drawer.getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(`projects/${project.uuid}/policyViolations`);
});

test('open a policy violation from its link', async ({ page }) => {
  const { violationMessage } = seed();
  // Stands in for a suppressed violation, which the table hides by default.
  await page.route('**/api/v1/violation/project/**', (route) =>
    route.fulfill({ json: [], headers: { 'X-Total-Count': '0' } }),
  );
  await login(page);
  await page.goto(violationLink(seed()));
  await expect(
    page
      .getByRole('dialog', { name: /jackson-databind/ })
      .getByRole('tabpanel', { name: 'Analysis' }),
  ).toContainText(violationMessage);
});

test('select a linked policy violation in the table', async ({ page }) => {
  const { violationPolicy, violationUuid } = seed();
  // Stands in for a project where the linked violation is not on the first page.
  await page.route('**/api/v1/violation/project/**', async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch();
    const violations = await response.json();
    await route.fulfill({
      response,
      json: url.searchParams.get('searchText')
        ? violations
        : violations.filter((v) => v.uuid !== violationUuid),
    });
  });
  await login(page);
  await page.goto(violationLink(seed()));
  await expect(
    page.getByRole('dialog', { name: /jackson-databind/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('row').filter({ hasText: violationPolicy }),
  ).toHaveAttribute('aria-current', 'true');
});

test('copy the link to a policy violation from the policy violation audit', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { project, violationPolicy } = seed();
  await login(page);
  await page.goto('policyViolationAudit');
  await auditSearch(page, project.name);
  await page
    .getByRole('row')
    .filter({ hasText: project.name })
    .filter({ hasText: violationPolicy })
    .press('Enter');
  await page
    .getByRole('dialog', { name: /jackson-databind/ })
    .getByRole('button', { name: 'Copy link' })
    .click();
  await expect(page.getByText('Copied to clipboard')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${APP_URL}/${violationLink(seed())}`,
  );
});
