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

export async function openUserMenu(page) {
  await page.locator('.fa-user-circle-o').click();
}

export async function setTheme(page, theme) {
  await openUserMenu(page);
  await page.getByRole('combobox', { name: 'Theme' }).selectOption(theme);
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

export async function auditSearch(page, text) {
  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByRole('menuitem', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill(text);
  const searched = page.waitForResponse(
    (res) =>
      res.url().includes('/api/') &&
      res.url().includes(encodeURIComponent(text)),
  );
  await page.getByRole('button', { name: 'Apply' }).click();
  // A row clicked before the filtered reload re-renders the table loses whatever it opened.
  await (await searched).finished();
}

// Client-side tables search the loaded rows without an API request, so search() would wait forever.
export async function filter(within, text) {
  const box = within.getByRole('searchbox', { name: 'Search' });
  const searched = await box.page().evaluateHandle(() => ({
    done: new Promise((resolve) => {
      const $ = window.jQuery;
      const onSearch = (event) => {
        // The searchbox's native search event on Enter also reaches this handler.
        if (event.namespace === 'bs.table') {
          $(document).off('search.bs.table', onSearch);
          resolve();
        }
      };
      $(document).on('search.bs.table', onSearch);
    }),
  }));
  await box.fill(text);
  await box.press('Enter');
  // The table searches 500 ms later, and that re-render collapses rows expanded before it.
  await searched.evaluate(({ done }) => done);
}

export async function expressionErrors(editor) {
  await editor.press('ControlOrMeta+Shift+KeyM');
  return editor.page().getByRole('listbox', { name: 'Diagnostics' });
}

export async function pickDate(page, label, date) {
  await page.getByLabel(label, { exact: true }).fill(formatDate(date));
}

export async function expectDate(page, label, date) {
  await expect(page.getByLabel(label, { exact: true })).toHaveValue(
    formatDate(date),
  );
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export async function pickOption(within, label, option) {
  const search = within.getByRole('textbox', { name: label });
  await within.getByRole('combobox').filter({ has: search }).click();
  await search.fill(option);
  await within.getByRole('option', { name: option, exact: true }).click();
}

// Selects a row by clicking its text rather than its checkbox. Pass text when name is a link.
export async function selectRow(within, name, text = name) {
  const row = within.getByRole('row', { name });
  await row.getByText(text).first().click();
  await expect(row.getByRole('checkbox')).toBeChecked();
}

// Opens a create dialog whose first request fails with 409,
// then expects the input to survive and Enter to retry exactly once
// while the retry is pending.
export async function expectCreateToSurviveFailure(
  page,
  { url, open, dialog, first, fill, created },
) {
  await page.route(url, (route) =>
    route.request().method() === 'PUT'
      ? route.fulfill({ status: 409 })
      : route.fallback(),
  );
  await open();
  const modal = page.getByRole('dialog', { name: dialog });
  const input = modal.getByRole('textbox', { name: first });
  await expect(input).toBeFocused();
  await fill(modal);
  const value = await input.inputValue();
  const failed = page.waitForResponse((res) => res.status() === 409);
  await modal.getByRole('button', { name: 'Create' }).click();
  await failed;
  await expect(input).toHaveValue(value);

  await page.unroute(url);
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  let creates = 0;
  await page.route(url, async (route) => {
    if (route.request().method() !== 'PUT') return route.fallback();
    creates++;
    await pending;
    await route.fallback();
  });
  await input.press('Enter');
  await expect(modal.getByRole('button', { name: 'Create' })).toBeDisabled();
  await input.press('Enter');
  release();
  await expect(page.getByText(created)).toBeVisible();
  await expect(modal).toBeHidden();
  expect(creates).toBe(1);
  await page.unroute(url);
}

// Button-styled radios hide the input behind its label.
export async function chooseRadio(within, name) {
  await within.getByRole('radiogroup').getByText(name, { exact: true }).click();
  await expect(within.getByRole('radio', { name, exact: true })).toBeChecked();
}

// locator.click() keeps waiting while an overlay intercepts the click.
export async function clickBehindOverlay(locator) {
  const box = await locator.boundingBox();
  await locator
    .page()
    .mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

// Awaiting it times out the test if no dialog appears.
export function dismissNextDialog(page) {
  return new Promise((resolve) =>
    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
      resolve();
    }),
  );
}
