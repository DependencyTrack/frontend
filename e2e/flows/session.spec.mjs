import { API_URL } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

async function endSession(page) {
  const token = await page.evaluate(() => sessionStorage.getItem('token'));
  await page.request.post(`${API_URL}/api/v1/user/logout`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

const portfolioMetrics = /^\/api\/v1\/metrics\/portfolio\/\d+\/days$/;

async function loaded(page, path) {
  const response = await page.waitForResponse(
    (response) =>
      path.test(new URL(response.url()).pathname) && response.status() === 200,
  );
  expect(await response.finished()).toBeNull();
}

test('verify the session only on the first page', async ({ page }) => {
  await login(page);
  const checks = [];
  page.on('request', (req) => {
    if (new URL(req.url()).pathname === '/api/v1/user/self') checks.push(req);
  });
  await page.getByRole('link', { name: 'Licenses', exact: true }).click();
  await expect(page).toHaveURL(/\/licenses$/);
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(checks).toEqual([]);
});

for (const [from, to, sourceData] of [
  ['Dashboard', 'Licenses', []],
  ['Licenses', 'Dashboard', [/^\/api\/v1\/license$/, portfolioMetrics]],
]) {
  test(`return to login when the session ends before opening ${to}`, async ({
    page,
    problems,
  }) => {
    problems.allow(/ 401$/);
    const dashboardReady = loaded(page, portfolioMetrics);
    await login(page);
    await dashboardReady;
    const sourceReady = sourceData.map((path) => loaded(page, path));
    await page.getByRole('link', { name: from, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${from.toLowerCase()}$`));
    // Expire a loaded source page, not its still-pending initial data requests.
    await Promise.all(sourceReady);
    await endSession(page);
    await page.getByRole('link', { name: to, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/login\\?redirect=/${to.toLowerCase()}$`),
    );
  });
}
