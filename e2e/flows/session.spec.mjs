import { API_URL } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

async function endSession(page) {
  const token = await page.evaluate(() => sessionStorage.getItem('token'));
  await page.request.post(`${API_URL}/api/v1/user/logout`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

for (const [from, to] of [
  ['Dashboard', 'Licenses'],
  ['Licenses', 'Dashboard'],
]) {
  test(`return to login when the session ends before opening ${to}`, async ({
    page,
    problems,
  }) => {
    problems.allow(/ 401$/);
    await login(page);
    await page.getByRole('link', { name: from, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${from.toLowerCase()}$`));
    await endSession(page);
    await page.getByRole('link', { name: to, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/login\\?redirect=/${to.toLowerCase()}$`),
    );
  });
}
