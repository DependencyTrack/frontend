import { uniqueName } from '../api.mjs';
import {
  test,
  expect,
  login,
  search,
  selectRow,
  expectCreateToSurviveFailure,
} from '../test.mjs';

test('create a notification alert and limit it to a tag', async ({ page }) => {
  const name = uniqueName('e2e-alert');
  const tag = uniqueName('tag');
  await login(page);
  await page.goto('admin/notifications/alerts');
  await page.getByRole('button', { name: 'Create Alert' }).click();

  const modal = page.getByRole('dialog', { name: 'Create Alert' });
  await modal.getByLabel('Name').fill(name);
  await modal.getByLabel('Publisher').selectOption({ label: 'Console' });
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Alert created')).toBeVisible();
  // Closing returns focus to the Create Alert button, where a keypress would reopen the dialog.
  await expect(modal).toBeHidden();

  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await page.getByText('NEW_VULNERABILITY', { exact: true }).click();
  await page.getByRole('button', { name: 'Limit To' }).click();
  await page.getByPlaceholder('Add Tag').fill(tag);
  await page.getByPlaceholder('Add Tag').press('Enter');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();

  await page.reload();
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'NEW_VULNERABILITY' }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Limit To' }).click();
  await expect(page.getByText(tag)).toBeVisible();
});

test('send an alert to a team in its row details', async ({ page, api }) => {
  const name = uniqueName('e2e-alert');
  const team = uniqueName('e2e-team');
  const publishers = await api.get('/v1/notification/publisher');
  const publisher = publishers.find((p) => p.name === 'Console');
  await api.send('PUT', '/v1/notification/rule', {
    name,
    scope: 'PORTFOLIO',
    notificationLevel: 'INFORMATIONAL',
    publisher: { uuid: publisher.uuid },
  });
  await api.send('PUT', '/v1/team', { name: team });
  await login(page);
  await page.goto('admin/notifications/alerts');
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  // The add button is an icon without an accessible name.
  await page.locator('#teamDestinationList .fa-plus-square').click();
  const modal = page.getByRole('dialog', { name: 'Select Team' });
  await search(page, team, modal);
  await selectRow(modal, team);
  await modal.getByRole('button', { name: 'Select' }).click();
  await expect(page.locator('#teamDestinationList')).toContainText(team);

  await page.reload();
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
  await expect(page.locator('#teamDestinationList')).toContainText(team);
});

test('keep the input of an alert that failed to create', async ({
  page,
  problems,
}) => {
  problems.allow(/^PUT \/api\/v1\/notification\/rule 409$/);
  await login(page);
  await page.goto('admin/notifications/alerts');
  await expectCreateToSurviveFailure(page, {
    url: '**/api/v1/notification/rule',
    open: () => page.getByRole('button', { name: 'Create Alert' }).click(),
    dialog: 'Create Alert',
    first: /^Name/,
    fill: async (modal) => {
      await modal.getByLabel('Name').fill(uniqueName('e2e-alert'));
      await modal.getByLabel('Publisher').selectOption({ label: 'Console' });
    },
    created: 'Alert created',
  });
});
