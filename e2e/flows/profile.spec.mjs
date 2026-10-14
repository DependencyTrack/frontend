import { uniqueName } from '../api.mjs';
import { test, expect, login, openUserMenu } from '../test.mjs';

test('profile shows the email saved in it', async ({ page, api }) => {
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
  const dialog = page.getByRole('dialog', { name: 'Update Profile' });

  await openUserMenu(page);
  await page.getByRole('menuitem', { name: 'Update Profile' }).click();
  await expect(dialog.getByLabel('Email')).toHaveValue(
    `${username}@example.com`,
  );
  await dialog.getByLabel('Full name').fill(username);
  await dialog.getByLabel('Email').fill(`renamed-${username}@example.com`);
  await dialog.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Profile updated')).toBeVisible();
  await expect(dialog).toBeHidden();

  await openUserMenu(page);
  await page.getByRole('menuitem', { name: 'Update Profile' }).click();
  await expect(dialog.getByLabel('Email')).toHaveValue(
    `renamed-${username}@example.com`,
  );
});
