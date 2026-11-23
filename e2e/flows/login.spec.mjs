import { test, expect } from '../test.mjs';

test('focus the username when the login form shows', async ({ page }) => {
  await page.goto('login');
  await expect(page.getByPlaceholder('Username')).toBeFocused();
});
