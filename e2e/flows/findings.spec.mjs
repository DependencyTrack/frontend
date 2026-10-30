import { seed } from '../api.mjs';
import {
  test,
  expect,
  login,
  search,
  chooseRadio,
  auditSearch,
  dismissNextDialog,
  clickBehindOverlay,
} from '../test.mjs';

// The seeded finding has no analysis until a test saves one.
test.beforeEach(({ problems }) =>
  problems.allow(/^GET \/api\/v1\/analysis\?.* 404$/),
);

// The table reloads after a save, which can still be inside a mocked route when a test ends.
test.afterEach(({ page }) => page.unrouteAll({ behavior: 'ignoreErrors' }));

// A copy of the seeded finding stands in for a second one.
function mockFindings(page, pick = (finding, copy) => [finding, copy]) {
  return page.route('**/api/v1/finding/project/**', async (route) => {
    const response = await route.fetch();
    const finding = (await response.json()).find(
      (f) => f.vulnerability.vulnId === seed().vulnId,
    );
    const copy = structuredClone(finding);
    copy.vulnerability.vulnId = 'E2E-COPY';
    copy.matrix += '-copy';
    await route.fulfill({ response, json: pick(finding, copy) });
  });
}

async function openFirstOfTwoFindings(page) {
  const { project, vulnId, vulnUuid } = seed();
  await mockFindings(page);
  await login(page);
  await page.goto(`projects/${project.uuid}/findings/${vulnUuid}`);
  await page.getByRole('row').filter({ hasText: vulnId }).press('Enter');
  const drawer = page.getByRole('dialog');
  await expect(drawer).toHaveAccessibleName(new RegExp(vulnId));
  return drawer;
}

// Visits another project tab first, so going back stays in the app.
async function openFindingFromComponents(page) {
  const { project, vulnId } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page.getByRole('tab', { name: /Audit Vulnerabilities/ }).click();
  await search(page, vulnId);
  await page.getByRole('row').filter({ hasText: vulnId }).press('Enter');
  return page.getByRole('dialog', { name: vulnId });
}

async function openSeededFinding(page) {
  const { project, vulnId, vulnUuid } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/findings/${vulnUuid}`);
  return page.getByRole('dialog', { name: vulnId });
}

// Answers saves with the submitted analysis, which leaves the shared finding untouched.
function mockSave(page, handler = () => {}) {
  return page.route('**/api/v1/analysis', async (route) => {
    await handler(route);
    await route.fulfill({ json: route.request().postDataJSON() });
  });
}

async function save(drawer) {
  const request = drawer.page().waitForRequest('**/api/v1/analysis');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  return (await request).postDataJSON();
}

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

test('audit a finding', async ({ page }) => {
  const { project, vulnId, vulnUuid } = seed();
  await login(page);
  // The deep link opens the finding when it is the only match.
  await page.goto(`projects/${project.uuid}/findings/${vulnUuid}`);

  const drawer = page.getByRole('dialog', { name: vulnId });
  await chooseRadio(drawer, 'In Triage');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: vulnId })).toContainText(
    'In Triage',
  );
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await drawer.getByRole('tab', { name: 'History' }).click();
  const history = drawer.getByRole('tabpanel', { name: 'History' });
  await expect(history).toContainText('IN_TRIAGE');
  await history.getByLabel('Comment').fill('Looks exploitable');
  await history.getByRole('button', { name: 'Add Comment' }).click();
  await expect(history).toContainText('Looks exploitable');
  await expect(history.getByLabel('Comment')).toHaveValue('');
  await expect(history.getByLabel('Comment')).toBeFocused();

  // Leaves the shared finding unsuppressed for the other tests.
  await mockSave(page);
  await drawer.getByRole('tab', { name: 'Analysis' }).click();
  const suppress = drawer.getByRole('checkbox', { name: 'Suppressed' });
  await suppress.check();
  expect((await save(drawer)).isSuppressed).toBe(true);
  await suppress.uncheck();
  expect((await save(drawer)).isSuppressed).toBe(false);
});

test('open a finding from the vulnerability audit', async ({ page }) => {
  const { project, vulnId } = seed();
  await login(page);
  await page.goto('vulnerabilityAudit/occurrences');
  await auditSearch(page, vulnId);
  const loaded = page.waitForRequest('**/api/v1/analysis?*');
  await page.getByRole('row').filter({ hasText: project.name }).press('Enter');
  await expect(page.getByRole('dialog', { name: vulnId })).toHaveAccessibleName(
    new RegExp(project.name),
  );
  expect(new URL((await loaded).url()).searchParams.get('project')).toBe(
    project.uuid,
  );
});

test('move between findings', async ({ page }) => {
  const drawer = await openFirstOfTwoFindings(page);
  await drawer.getByRole('tab', { name: 'History' }).click();
  const next = drawer.getByRole('button', { name: 'Next row' });
  await next.click();
  await expect(drawer).toHaveAccessibleName(/E2E-COPY/);
  await expect(next).toBeFocused();
  await expect(
    page.getByRole('row').filter({ hasText: 'E2E-COPY' }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(drawer.getByRole('tab', { name: 'History' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await drawer.getByRole('button', { name: 'Previous row' }).click();
  await expect(drawer).toHaveAccessibleName(new RegExp(seed().vulnId));
});

test('move between findings with J and K', async ({ page }) => {
  const drawer = await openFirstOfTwoFindings(page);
  await expect(drawer).toBeFocused();
  await page.keyboard.press('j');
  await expect(drawer).toHaveAccessibleName(/E2E-COPY/);
  const details = drawer.getByLabel('Details');
  await expect(details).toBeEnabled();
  await details.press('k');
  await expect(details).toHaveValue('k');
  await expect(drawer).toHaveAccessibleName(/E2E-COPY/);
  await details.fill('');
  await drawer.getByRole('radio', { name: 'Exploitable' }).press('k');
  await expect(drawer).toHaveAccessibleName(new RegExp(seed().vulnId));
});

test('keep the save button in view', async ({ page }) => {
  const drawer = await openSeededFinding(page);
  await expect(
    drawer.getByRole('button', { name: 'Save', exact: true }),
  ).toBeInViewport();
});

test('keep an unsaved analysis when declining to discard it', async ({
  page,
}) => {
  const drawer = await openFirstOfTwoFindings(page);
  await chooseRadio(drawer, 'Exploitable');
  let dismissed = dismissNextDialog(page);
  await drawer.getByRole('button', { name: 'Next row' }).click();
  await dismissed;
  dismissed = dismissNextDialog(page);
  await clickBehindOverlay(
    page
      .getByRole('row')
      .filter({ hasText: 'E2E-COPY' })
      .getByRole('cell', { name: 'com.fasterxml.jackson.core' }),
  );
  await dismissed;
  await expect(drawer).toHaveAccessibleName(new RegExp(seed().vulnId));
  await expect(
    drawer.getByRole('radio', { name: 'Exploitable' }),
  ).toBeChecked();
});

test('keep an unsaved comment when declining to discard it', async ({
  page,
}) => {
  const drawer = await openFirstOfTwoFindings(page);
  await drawer.getByRole('tab', { name: 'History' }).click();
  const comment = drawer.getByLabel('Comment');
  await comment.fill('Half a thought');
  const dismissed = dismissNextDialog(page);
  await drawer.getByRole('button', { name: 'Next row' }).click();
  await dismissed;
  await expect(drawer).toHaveAccessibleName(new RegExp(seed().vulnId));
  await expect(comment).toHaveValue('Half a thought');
});

test('add a comment without unsaved analysis changes', async ({ page }) => {
  await page.route('**/api/v1/analysis?*', (route) =>
    route.fulfill({
      json: { analysisState: 'IN_TRIAGE', analysisComments: [] },
    }),
  );
  await page.route('**/api/v1/analysis', (route) =>
    route.fulfill({
      json: {
        analysisState: 'IN_TRIAGE',
        analysisComments: [{ timestamp: 0, comment: 'Needs a closer look' }],
      },
    }),
  );
  const drawer = await openSeededFinding(page);
  await chooseRadio(drawer, 'Exploitable');
  await drawer.getByRole('tab', { name: 'History' }).click();
  const history = drawer.getByRole('tabpanel', { name: 'History' });
  await history.getByLabel('Comment').fill('Needs a closer look');
  const request = page.waitForRequest('**/api/v1/analysis');
  await history.getByLabel('Comment').press('ControlOrMeta+Enter');
  const body = (await request).postDataJSON();
  expect(body.analysisState).toBe('IN_TRIAGE');
  expect(body.comment).toBe('Needs a closer look');
  await expect(history).toContainText('Needs a closer look');
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await drawer.getByRole('tab', { name: 'Analysis' }).click();
  await expect(
    drawer.getByRole('radio', { name: 'Exploitable' }),
  ).toBeChecked();
});

test('save an analysis and move on with the keyboard', async ({ page }) => {
  const drawer = await openFirstOfTwoFindings(page);
  await mockSave(page);
  await chooseRadio(drawer, 'False Positive');
  const saved = page.waitForRequest('**/api/v1/analysis');
  await drawer.getByLabel('Details').press('ControlOrMeta+Enter');
  expect((await saved).postDataJSON().analysisState).toBe('FALSE_POSITIVE');
  await expect(drawer).toHaveAccessibleName(new RegExp(seed().vulnId));
  await expect(drawer.getByRole('form', { name: 'Analysis' })).toBeFocused();
  await page.keyboard.press('j');
  await expect(drawer).toHaveAccessibleName(/E2E-COPY/);
});

test('hide a finding once it is suppressed', async ({ page }) => {
  const { vulnId } = seed();
  const drawer = await openFirstOfTwoFindings(page);
  await mockSave(page);
  await mockFindings(page, (_finding, copy) => [copy]);
  await drawer.getByRole('checkbox', { name: 'Suppressed' }).check();
  await save(drawer);
  await expect(page.getByRole('row').filter({ hasText: vulnId })).toBeHidden();
  await expect(drawer).toHaveAccessibleName(new RegExp(vulnId));
  await page.keyboard.press('j');
  await expect(drawer).toHaveAccessibleName(/E2E-COPY/);
});

test('close a finding by clicking outside it', async ({ page }) => {
  const drawer = await openFirstOfTwoFindings(page);
  await clickBehindOverlay(
    page
      .getByRole('row')
      .filter({ hasText: 'E2E-COPY' })
      .getByRole('cell', { name: 'com.fasterxml.jackson.core' }),
  );
  await expect(drawer).toBeHidden();
});

test('allow changes once the analysis has loaded', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  await page.route('**/api/v1/analysis?*', async (route) => {
    await pending;
    await route.fulfill({ json: { analysisComments: [] } });
  });
  const drawer = await openSeededFinding(page);
  const suppressed = drawer.getByRole('checkbox', { name: 'Suppressed' });
  await expect(suppressed).toBeDisabled();
  await drawer.getByRole('tab', { name: 'History' }).click();
  const comment = drawer.getByLabel('Comment');
  await expect(comment).toBeHidden();
  release();
  await expect(comment).toBeVisible();
  await drawer.getByRole('tab', { name: 'Analysis' }).click();
  await expect(suppressed).toBeEnabled();
});

test('keep the analysis read-only when it fails to load', async ({
  page,
  problems,
}) => {
  problems.allow(/^GET \/api\/v1\/analysis\?.* 500$/);
  await page.route('**/api/v1/analysis?*', (route) =>
    route.fulfill({ status: 500 }),
  );
  const drawer = await openSeededFinding(page);
  await expect(
    drawer.getByText('Could not perform the requested action'),
  ).toBeVisible();
  await expect(
    drawer.getByRole('checkbox', { name: 'Suppressed' }),
  ).toBeDisabled();
});

test('save an analysis once when submitting it twice', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  let saves = 0;
  await mockSave(page, async () => {
    saves++;
    await pending;
  });
  const drawer = await openSeededFinding(page);
  await chooseRadio(drawer, 'Resolved');
  const details = drawer.getByLabel('Details');
  await details.fill('Fixed upstream');
  await details.press('ControlOrMeta+Enter');
  await expect(details).toBeDisabled();
  await drawer
    .getByRole('form', { name: 'Analysis' })
    .press('ControlOrMeta+Enter');
  release();
  await expect(details).toBeEditable();
  expect(saves).toBe(1);
});

test('keep a justification until the state changes', async ({ page }) => {
  await page.route('**/api/v1/analysis?*', (route) =>
    route.fulfill({
      json: {
        analysisState: 'EXPLOITABLE',
        analysisJustification: 'CODE_NOT_PRESENT',
        analysisComments: [],
      },
    }),
  );
  await mockSave(page);
  const drawer = await openSeededFinding(page);
  await drawer.getByLabel('Details').fill('Still exploitable');
  expect((await save(drawer)).analysisJustification).toBe('CODE_NOT_PRESENT');
  await chooseRadio(drawer, 'In Triage');
  await chooseRadio(drawer, 'Exploitable');
  await expect(drawer.getByText('Unsaved changes')).toBeHidden();
  await chooseRadio(drawer, 'In Triage');
  expect((await save(drawer)).analysisJustification).toBe('NOT_SET');
});

test('keep focus on the finding when the table reloads after closing it', async ({
  page,
}) => {
  const { project, vulnId, vulnUuid } = seed();
  await mockFindings(page);
  await login(page);
  await page.goto(`projects/${project.uuid}/findings/${vulnUuid}`);
  const row = page.getByRole('row').filter({ hasText: vulnId });
  await row.getByRole('cell', { name: 'Critical' }).click();
  const drawer = page.getByRole('dialog', { name: vulnId });
  await expect(drawer).toBeFocused();
  await mockSave(page);
  await mockFindings(page, (finding, copy) => {
    finding.component.version = '9.9.9';
    return [finding, copy];
  });
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  await page.route('**/api/v1/finding/project/**', async (route) => {
    await pending;
    await route.fallback();
  });
  await chooseRadio(drawer, 'Resolved');
  await save(drawer);
  await expect(drawer.getByLabel('Details')).toBeEditable();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(row).toBeFocused();
  release();
  await expect(row).toContainText('9.9.9');
  await expect(row).toBeFocused();
});

test('show the vulnerability next to its analysis', async ({ page }) => {
  const { vulnId, vulnRecommendation } = seed();
  const drawer = await openSeededFinding(page);
  const analysis = drawer.getByRole('tabpanel', { name: 'Analysis' });
  await expect(analysis).toContainText('CVSS v4.0 9.3');
  await expect(analysis).toContainText('EPSS 50% (90th percentile)');
  await expect(analysis.getByRole('button', { name: 'KEV' })).toBeVisible();
  for (const alias of [`CVE-${vulnId}`, `GHSA-${vulnId}`]) {
    await expect(analysis.getByRole('link', { name: alias })).toBeVisible();
  }
  await analysis.getByText('Ratings').click();
  await expect(analysis).toContainText(
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
  );
  await expect(analysis).toContainText(vulnRecommendation);
  await expect(
    analysis.getByRole('checkbox', { name: 'Suppressed' }),
  ).toBeVisible();
  const more = analysis.getByRole('button', { name: 'Show more' });
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await more.click();
  await expect(
    analysis.getByRole('button', { name: 'Show less' }),
  ).toHaveAttribute('aria-expanded', 'true');
});

test('keep a deep-linked finding closed after a reload', async ({ page }) => {
  const drawer = await openSeededFinding(page);
  await expect(drawer).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await mockFindings(page, (finding) => {
    finding.component.version = '9.9.9';
    return [finding];
  });
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(
    page.getByRole('row').filter({ hasText: seed().vulnId }),
  ).toContainText('9.9.9');
  await expect(drawer).toBeHidden();
});

test('wait for a save before moving to another finding', async ({ page }) => {
  const drawer = await openFirstOfTwoFindings(page);
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  await mockSave(page, () => pending);
  const dialogs = [];
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.message());
    dialog.dismiss();
  });
  await chooseRadio(drawer, 'Resolved');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  const next = drawer.getByRole('button', { name: 'Next row' });
  await expect(next).toBeDisabled();
  release();
  await expect(next).toBeEnabled();
  await next.click();
  await expect(drawer).toHaveAccessibleName(/E2E-COPY/);
  expect(dialogs).toEqual([]);
});

test('show a short description in full', async ({ page }) => {
  await page.route('**/api/v1/finding/project/**', async (route) => {
    const response = await route.fetch();
    const findings = await response.json();
    for (const finding of findings) {
      finding.vulnerability.description =
        'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.\n\nLast paragraph.';
    }
    await route.fulfill({ response, json: findings });
  });
  const drawer = await openSeededFinding(page);
  const description = drawer.getByText('First paragraph.');
  await expect(description).toContainText('Last paragraph.');
  await expect(drawer.getByRole('button', { name: 'Show more' })).toHaveCount(
    0,
  );
  expect(
    await description.evaluate((el) => el.scrollHeight <= el.clientHeight),
  ).toBe(true);
});

test('keep a comment and an analysis that failed to save', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/analysis 500$/);
  await page.route('**/api/v1/analysis', (route) =>
    route.fulfill({ status: 500 }),
  );
  const failed = page.getByText('Could not perform the requested action');
  const drawer = await openSeededFinding(page);
  await drawer.getByRole('tab', { name: 'History' }).click();
  const comment = drawer.getByLabel('Comment');
  await comment.fill('Try again');
  await drawer.getByRole('button', { name: 'Add Comment' }).click();
  await expect(failed).toHaveCount(1);
  await expect(comment).toHaveValue('Try again');
  const dismissed = dismissNextDialog(page);
  await page.keyboard.press('Escape');
  await dismissed;
  await expect(drawer).toBeVisible();

  await drawer.getByRole('tab', { name: 'Analysis' }).click();
  await chooseRadio(drawer, 'Exploitable');
  await drawer.getByLabel('Details').fill('Retry later');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(failed).toHaveCount(2);
  await expect(
    drawer.getByRole('radio', { name: 'Exploitable' }),
  ).toBeChecked();
  await expect(drawer.getByLabel('Details')).toHaveValue('Retry later');
  await expect(
    drawer.getByRole('button', { name: 'Save', exact: true }),
  ).toBeEnabled();
});

test('discard changes to an analysis', async ({ page }) => {
  await page.route('**/api/v1/analysis?*', (route) =>
    route.fulfill({
      json: { analysisState: 'IN_TRIAGE', analysisComments: [] },
    }),
  );
  const drawer = await openSeededFinding(page);
  await chooseRadio(drawer, 'Exploitable');
  await drawer.getByRole('button', { name: 'Discard' }).click();
  await expect(drawer.getByRole('radio', { name: 'In Triage' })).toBeChecked();
  await expect(drawer.getByText('Unsaved changes')).toBeHidden();
});

test('keep an unsent comment when leaving during a save', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  await mockSave(page, () => pending);
  const drawer = await openFindingFromComponents(page);
  await drawer.getByRole('tab', { name: 'History' }).click();
  const comment = drawer.getByLabel('Comment');
  await comment.fill('Half a thought');
  await drawer.getByRole('tab', { name: 'Analysis' }).click();
  await chooseRadio(drawer, 'Resolved');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  const dismissed = dismissNextDialog(page);
  await page.goBack();
  await dismissed;
  await expect(page).toHaveURL(/\/findings$/);
  release();
  await drawer.getByRole('tab', { name: 'History' }).click();
  await expect(comment).toHaveValue('Half a thought');
});

test('leave the page while an analysis is being saved', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  await mockSave(page, () => pending);
  const drawer = await openFindingFromComponents(page);
  await chooseRadio(drawer, 'Resolved');
  await drawer.getByRole('button', { name: 'Save', exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/components$/);
  await expect(drawer).toBeHidden();
  await expect(
    page.getByRole('textbox', { name: 'Details', includeHidden: true }),
  ).toHaveCount(0);
  const reloaded = page.waitForRequest('**/api/v1/finding/project/**');
  release();
  await reloaded;
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
