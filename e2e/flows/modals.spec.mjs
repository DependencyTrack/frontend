import { seed, uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

async function closeWithEscape(modal) {
  // A modal only handles Escape once it has taken the focus.
  await expect
    .poll(() => modal.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  await modal.page().keyboard.press('Escape');
  await expect(modal).toBeHidden();
}

for (const [kind, path] of [
  ['Project', () => `projects/${seed().project.uuid}`],
  ['Component', () => `components/${seed().componentUuid}`],
]) {
  test(`open the ${kind.toLowerCase()} properties from its details`, async ({
    page,
  }) => {
    await login(page);
    await page.goto(path());
    const details = page.getByRole('dialog', { name: `${kind} Details` });
    const properties = page.getByRole('dialog', { name: `${kind} Properties` });
    const create = page.getByRole('dialog', {
      name: `Create ${kind} Property`,
    });
    await page.getByText('View Details').click();
    await details.getByRole('button', { name: 'Properties' }).click();
    await expect(properties).toBeVisible();
    await expect(details).toBeHidden();
    await properties.getByRole('button', { name: 'Create Property' }).click();
    await expect(create).toBeVisible();
    await expect(properties).toBeHidden();
    await closeWithEscape(create);

    await page.getByText('View Details').click();
    await expect(details).toBeVisible();
  });
}

test('edit the secret that was clicked', async ({ page, api }) => {
  const prefix = uniqueName('e2e-secret');
  for (const name of [`${prefix}-a`, `${prefix}-b`]) {
    await api.send('POST', '/v2/secrets', { name, value: 'hunter2' });
  }
  await login(page);
  await page.goto('admin/secrets/management');
  await search(page, prefix);
  for (const name of [`${prefix}-a`, `${prefix}-b`]) {
    await page
      .getByRole('row', { name: new RegExp(name) })
      .getByTitle('Edit secret')
      .click();
    const modal = page.getByRole('dialog', { name: `Update secret ${name}` });
    await expect(modal).toBeVisible();
    await closeWithEscape(modal);
  }
});

test('show why a login failed every time', async ({ page, problems }) => {
  problems.allow(/^POST \/api\/v1\/user\/login 401$/);
  await page.goto('login');
  await page.getByPlaceholder('Username').fill(uniqueName('e2e-nobody'));
  await page.getByPlaceholder('Password').fill('wrong');
  const modal = page.getByRole('dialog', { name: 'Information' });
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();
  }
});
