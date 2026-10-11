import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('new managed user changes their password before logging in', async ({
  page,
  problems,
  api,
}) => {
  problems.allow(/^POST \/api\/v1\/user\/login 401$/);
  const username = uniqueName('e2e-user');
  await api.send('PUT', '/v1/user/managed', {
    username,
    fullname: username,
    email: `${username}@example.com`,
    newPassword: 'initial-password',
    confirmPassword: 'initial-password',
    forcePasswordChange: true,
  });
  await api.send('POST', `/v1/permission/VIEW_PORTFOLIO/user/${username}`);

  await login(page, username, 'initial-password');
  await expect(
    page.getByRole('heading', { name: 'Update Password' }),
  ).toBeVisible();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Current password').fill('initial-password');
  await page
    .getByLabel('New password', { exact: true })
    .fill('changed-password');
  await page.getByLabel('Confirm new password').fill('changed-password');
  await page.getByRole('button', { name: 'Change password' }).click();

  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await login(page, username, 'changed-password');
  await expect(page).toHaveURL(/\/dashboard$/);
});
