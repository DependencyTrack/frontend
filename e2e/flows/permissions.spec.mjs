import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('redirect from a page the user may not see to the dashboard', async ({
  page,
  api,
}) => {
  const username = uniqueName('e2e-user');
  await api.send('PUT', '/v1/user/managed', {
    username,
    fullname: username,
    email: `${username}@example.com`,
    newPassword: 'password',
    confirmPassword: 'password',
  });
  await api.send('POST', `/v1/permission/VIEW_PORTFOLIO/user/${username}`);

  await login(page, username, 'password');
  await page.goto('admin');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Forbidden (403)' }),
  ).toBeVisible();
});
