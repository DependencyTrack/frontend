import { test as base, expect } from '@playwright/test';
import { ADMIN_PASSWORD, Api } from './api.mjs';

export const test = base.extend({
  api: [
    async ({}, use) => {
      const api = await Api.login();
      await use(api);
      await api.dispose();
    },
    { scope: 'worker' },
  ],
  problems: [
    async ({ page }, use) => {
      const found = [];
      const allowed = [];
      page.on('console', (msg) => {
        // The response listener already reports failed requests.
        if (
          msg.type() === 'error' &&
          !msg.text().startsWith('Failed to load resource')
        ) {
          found.push(`console.error: ${msg.text()}`);
        }
      });
      page.on('pageerror', (error) =>
        found.push(`pageerror: ${error.message}`),
      );
      page.on('response', (res) => {
        const url = new URL(res.url());
        if (res.status() >= 400) {
          found.push(
            `${res.request().method()} ${url.pathname}${url.search} ${res.status()}`,
          );
        }
      });
      await use({ allow: (pattern) => allowed.push(pattern) });
      expect(found.filter((p) => !allowed.some((a) => a.test(p)))).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function login(
  page,
  username = 'admin',
  password = ADMIN_PASSWORD,
) {
  await page.goto('login');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

export async function search(page, text, within = page) {
  const box = within.getByRole('searchbox', { name: 'Search' });
  const loading = within
    .getByText('Loading, please wait')
    .filter({ visible: true });
  await expect(box).toBeVisible();
  // A load that finishes after the search would replace the filtered rows.
  await expect(loading).toHaveCount(0);
  const searched = page.waitForResponse(
    (res) =>
      res.url().includes('/api/') &&
      res.url().includes(encodeURIComponent(text)),
  );
  await box.fill(text);
  // Tables search on key events, which fill() doesn't fire.
  await box.press('Enter');
  await searched;
  await expect(loading).toHaveCount(0);
}

// Client-side tables search the loaded rows without an API request, so search() would wait forever.
export async function filter(within, text) {
  const box = within.getByRole('searchbox', { name: 'Search' });
  await box.fill(text);
  await box.press('Enter');
}

// Tests pick dates only through these helpers, so replacing the datepicker only changes them.
export async function pickDate(page, label, date) {
  await page.getByRole('button', { name: label }).click();
  const calendar = page.getByRole('dialog');
  await expect(
    calendar.getByRole('button', { name: 'Next month' }),
  ).toBeVisible();
  const day = calendar.getByRole('button', {
    name: new RegExp(`^${formatDate(date)}`),
  });
  for (let i = 0; i < 24 && !(await day.isVisible()); i++) {
    await calendar.getByRole('button', { name: 'Next month' }).click();
  }
  await day.click();
}

export async function expectDate(page, label, date) {
  await expect(page.getByRole('button', { name: label })).toHaveAccessibleName(
    `${label} ${formatDate(date)}`,
  );
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// CoreUI's <c-switch> hides its checkbox with display: none, and its text is a sibling, not a label.
export function switchNear(page, text) {
  return page
    .getByRole('group')
    .filter({ hasText: text })
    .last()
    .getByRole('checkbox', { includeHidden: true });
}

export async function toggleSwitch(checkbox) {
  await checkbox.evaluate((input) => input.click());
}
