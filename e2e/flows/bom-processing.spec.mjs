import { Api, uniqueName } from '../api.mjs';
import { bomFile, cycloneDxBom, truncatedBom } from '../bom.mjs';
import {
  bomSidebarIndicator,
  bomStatusBanner,
  controlBomTokenStatus,
  expect,
  login,
  openSidebarLink,
  search,
  serveBomTokenStatuses,
  test,
  trackBomUpload,
  uploadBom,
} from '../test.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const createdProjects = [];

async function createProject(api) {
  const project = await api.send('PUT', '/v1/project', {
    name: uniqueName('e2e-bom'),
    version: '1.0.0',
  });
  createdProjects.push(project.uuid);
  return project;
}

// An import that is still running in the background blocks the deletion.
test.afterEach(async ({ api }) => {
  for (const uuid of createdProjects.splice(0)) {
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        await api.send('DELETE', `/v1/project/${uuid}`);
        break;
      } catch {
        await sleep(1000);
      }
    }
  }
});

test.describe('upload dialog', () => {
  test('shows progress, then that processing has started', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await serveBomTokenStatuses(page, ['PENDING']);
    await login(page);
    await page.goto(`projects/${project.uuid}`);

    // Hold the upload, to see the state while bytes are being sent.
    let release;
    const held = new Promise((resolve) => (release = resolve));
    await page.route('**/api/v1/bom', async (route) => {
      await held;
      await route.continue();
    });
    const modal = await uploadBom(
      page,
      bomFile(cycloneDxBom(3), 'my-bom.json'),
    );
    await expect(
      modal.getByRole('progressbar', { name: 'Upload progress' }),
    ).toBeVisible();
    await expect(modal.getByText('Uploading my-bom.json')).toBeVisible();
    release();

    await expect(
      modal.getByText('Upload received, processing has started'),
    ).toBeVisible();
    await expect(
      modal.getByText('processing continues on the server'),
    ).toBeVisible();
    await expect(page.getByText('BOM uploaded')).toBeHidden();
    await expect(
      page.getByText('BOM received. Processing has started.'),
    ).toBeVisible();

    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();
  });

  test('keeps reporting HTTP errors of the upload', async ({
    page,
    api,
    problems,
  }) => {
    // The server rejects the upload, which the generic error toast reports.
    // The dialog has never handled the rejected request, so it also surfaces as a page error.
    problems.allow(/^POST \/api\/v1\/bom 400$/);
    problems.allow(/^pageerror: Request failed with status code 400$/);
    const project = await createProject(api);
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    await page.route('**/api/v1/bom', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/problem+json',
        json: { title: 'Invalid BOM', detail: 'Nope', status: 400 },
      }),
    );
    const modal = await uploadBom(page, bomFile(cycloneDxBom(1)));
    await expect(page.getByText('Invalid BOM')).toBeVisible();
    await expect(
      modal.getByRole('button', { name: 'Upload', exact: true }),
    ).toBeEnabled();
    await expect(
      modal.getByText('Upload received, processing has started'),
    ).toBeHidden();
  });
});

test.describe('project status banner', () => {
  test('follows the processing from queued to completed', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await serveBomTokenStatuses(page, ['PENDING', 'RUNNING', 'COMPLETED']);
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    const modal = await uploadBom(page, bomFile(cycloneDxBom(3)));
    await modal.getByRole('button', { name: 'Close' }).click();

    const queued = bomStatusBanner(page, 'BOM queued for processing');
    await expect(queued).toBeVisible();
    await expect(queued).toContainText('Started');
    await expect(queued).toContainText('You can leave this page');

    const running = bomStatusBanner(page, 'Processing BOM…');
    await expect(running).toBeVisible();
    await expect(queued).toBeHidden();

    const projectReloaded = page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        new URL(res.url()).pathname === `/api/v1/project/${project.uuid}`,
    );
    const completed = bomStatusBanner(page, 'BOM processed');
    await expect(completed).toBeVisible();
    await projectReloaded;
    await expect(running).toBeHidden();

    await completed.getByRole('button', { name: 'Dismiss' }).click();
    await expect(completed).toBeHidden();
    // Shown once: a reload brings it back neither.
    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Upload BOM' }),
    ).toBeVisible();
    await expect(bomStatusBanner(page, 'BOM processed')).toBeHidden();
  });

  test('reports a failure and offers to upload again', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await serveBomTokenStatuses(page, ['RUNNING', 'FAILED']);
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    const modal = await uploadBom(page, bomFile(cycloneDxBom(2)));
    await modal.getByRole('button', { name: 'Close' }).click();

    const failed = bomStatusBanner(page, 'BOM processing failed');
    await expect(failed).toBeVisible();
    await expect(failed).toContainText(
      'The previously imported data is unchanged.',
    );
    await failed.getByRole('button', { name: 'Upload again' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Upload BOM' }),
    ).toBeVisible();
  });

  test('forgets a token the server no longer knows without an error', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await serveBomTokenStatuses(page, [null]);
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    const modal = await uploadBom(page, bomFile(cycloneDxBom(1)));
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(
      page.getByRole('button', { name: 'Upload BOM' }),
    ).toBeVisible();
    await expect(
      bomStatusBanner(page, 'BOM queued for processing'),
    ).toBeHidden();
    await expect(bomStatusBanner(page, 'BOM processing failed')).toBeHidden();
    await expect(bomStatusBanner(page, 'BOM processed')).toBeHidden();
  });
});

test.describe('against the real server', () => {
  test('refreshes the project by itself when processing completes', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    await expect(page.getByText('Last BOM Import:')).toBeVisible();
    await expect(
      page.getByText('Last BOM Import:').locator('..'),
    ).toContainText('n/a');

    const modal = await uploadBom(page, bomFile(cycloneDxBom(20)));
    await modal.getByRole('button', { name: 'Close' }).click();

    await expect(bomStatusBanner(page, 'BOM processed')).toBeVisible({
      timeout: 60_000,
    });
    // No reload: the header shows the import that just happened.
    await expect(
      page.getByText('Last BOM Import:').locator('..'),
    ).not.toContainText(/Last BOM Import:\s*n\/a/);
    await page.getByRole('tab', { name: 'Components' }).click();
    await expect(
      page.getByRole('link', { name: 'e2e-library-0', exact: true }),
    ).toBeVisible();
  });

  test('reports a genuinely failed import', async ({ page, api }) => {
    const project = await createProject(api);
    const properties = await api.get('/v1/configProperty');
    const validationMode = properties.find(
      (p) =>
        p.groupName === 'artifact' && p.propertyName === 'bom.validation.mode',
    )?.propertyValue;
    const setValidationMode = (client, propertyValue) =>
      client.send('POST', '/v1/configProperty', {
        groupName: 'artifact',
        propertyName: 'bom.validation.mode',
        propertyValue,
      });
    // With validation on, the server rejects a truncated file right away.
    // Turning it off lets the upload through and fails the import while parsing.
    await setValidationMode(api, 'DISABLED');
    try {
      await login(page);
      await page.goto(`projects/${project.uuid}`);
      const modal = await uploadBom(page, bomFile(truncatedBom(50)));
      await modal.getByRole('button', { name: 'Close' }).click();

      const failed = bomStatusBanner(page, 'BOM processing failed');
      await expect(failed).toBeVisible({ timeout: 60_000 });
      await expect(failed).toContainText(
        'The previously imported data is unchanged.',
      );
      await expect(
        failed.getByRole('button', { name: 'Upload again' }),
      ).toBeVisible();
    } finally {
      // The shared client is gone when the test timed out, which must not leave validation off.
      const restoring = await Api.login();
      try {
        await setValidationMode(restoring, validationMode ?? 'ENABLED');
      } finally {
        await restoring.dispose();
      }
    }
  });
});

test.describe('leaving and returning', () => {
  async function startUpload(page, project, status) {
    const token = await controlBomTokenStatus(page, status);
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    const modal = await uploadBom(page, bomFile(cycloneDxBom(2)));
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(bomStatusBanner(page, 'Processing BOM…')).toBeVisible();
    return token;
  }

  test('shows a running upload in the sidebar and the project list', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await startUpload(page, project, 'RUNNING');

    await openSidebarLink(page, 'Projects');
    const indicator = bomSidebarIndicator(page, project.name);
    await expect(indicator).toBeVisible();
    await search(page, project.name);
    const row = page.getByRole('row', { name: new RegExp(project.name) });
    await expect(row.getByText('Processing BOM')).toBeVisible();

    await indicator.click();
    await expect(page).toHaveURL(new RegExp(`/projects/${project.uuid}$`));
    await expect(bomStatusBanner(page, 'Processing BOM…')).toBeVisible();
  });

  for (const [status, message] of [
    ['COMPLETED', 'BOM processed'],
    ['FAILED', 'BOM processing failed'],
  ]) {
    test(`links to the project when processing ends as ${status} elsewhere`, async ({
      page,
      api,
    }) => {
      const project = await createProject(api);
      const token = await startUpload(page, project, 'RUNNING');
      await openSidebarLink(page, 'Projects');
      await expect(bomSidebarIndicator(page, project.name)).toBeVisible();

      token.set(status);
      const toast = page.getByText(`${message} for ${project.name}`);
      await expect(toast).toBeVisible({ timeout: 20_000 });
      await expect(bomSidebarIndicator(page, project.name)).toBeHidden();

      await page.getByRole('link', { name: `Open ${project.name}` }).click();
      await expect(page).toHaveURL(new RegExp(`/projects/${project.uuid}$`));
      // The toast reported it, so the page does not repeat it.
      await expect(
        page.getByRole('button', { name: 'Upload BOM' }),
      ).toBeVisible();
      await expect(bomStatusBanner(page, message)).toBeHidden();
    });
  }

  test('keeps the time since the upload started across navigation and reloads', async ({
    page,
    api,
  }) => {
    const project = await createProject(api);
    await controlBomTokenStatus(page, 'RUNNING');
    await login(page);
    await page.goto(`projects/${project.uuid}`);
    await trackBomUpload(page, {
      projectUuid: project.uuid,
      projectName: project.name,
      projectVersion: '1.0.0',
      startedAgoMs: 4 * 60 * 1000,
    });
    await page.reload();

    const banner = bomStatusBanner(page, 'Processing BOM…');
    await expect(banner).toContainText(/Started [45]m ago/);

    await openSidebarLink(page, 'Projects');
    await bomSidebarIndicator(page, project.name).click();
    await expect(banner).toContainText(/Started [45]m ago/);

    await page.reload();
    await expect(banner).toContainText(/Started [45]m ago/);
  });
});
