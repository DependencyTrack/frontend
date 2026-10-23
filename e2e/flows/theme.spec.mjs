import { test, expect, login, setTheme } from '../test.mjs';

test('keep the chosen theme after a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await login(page);
  const html = page.locator('html');

  await setTheme(page, 'Light');
  await expect(html).toHaveAttribute('data-bs-theme', 'light');
  await page.reload();
  await expect(html).toHaveAttribute('data-bs-theme', 'light');

  await page.emulateMedia({ colorScheme: 'light' });
  await setTheme(page, 'Dark');
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
  await page.reload();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
});

test('follow the system color scheme by default', async ({ page }) => {
  const html = page.locator('html');
  await page.emulateMedia({ colorScheme: 'light' });
  await login(page);
  await expect(html).toHaveAttribute('data-bs-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
});

test('ignore the system color scheme once a theme is chosen', async ({
  page,
}) => {
  const html = page.locator('html');
  await page.emulateMedia({ colorScheme: 'dark' });
  await login(page);
  await setTheme(page, 'Light');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html).toHaveAttribute('data-bs-theme', 'light');
});

test('keep unsaved input when the theme changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await login(page);
  await page.goto('policy/vulnerability/new');
  const name = page.getByRole('textbox', { name: /^Name/ });
  await name.fill('unsaved');

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'light');
  await expect(name).toHaveValue('unsaved');
});
