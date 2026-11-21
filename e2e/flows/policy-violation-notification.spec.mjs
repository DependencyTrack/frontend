import { uniqueName } from '../api.mjs';
import { test, expect, login, search } from '../test.mjs';

const updateGroup = 'POLICY_VIOLATION_UPDATED';
const reviewedGroup = 'POLICY_VIOLATION_UPDATED_REVIEWED';

async function createAlert(api, notifyOn = []) {
  const publishers = await api.get('/v1/notification/publisher');
  const publisher = publishers.find(
    (candidate) => candidate.name === 'Console',
  );
  expect(publisher).toBeDefined();
  return api.send('PUT', '/v1/notification/rule', {
    name: uniqueName('e2e-policy-update-alert'),
    scope: 'PORTFOLIO',
    triggerType: 'EVENT',
    notificationLevel: 'INFORMATIONAL',
    publisher: { uuid: publisher.uuid },
    notifyOn,
  });
}

async function openAlert(page, name) {
  await page.goto('admin/notifications/alerts');
  await search(page, name);
  await page.getByRole('cell', { name, exact: true }).click();
}

async function readAlert(api, alert) {
  const rules = await api.get(
    `/v1/notification/rule?searchText=${encodeURIComponent(alert.name)}`,
  );
  const persisted = rules.find((candidate) => candidate.uuid === alert.uuid);
  expect(persisted).toBeDefined();
  return persisted;
}

test('preserve a creation-only alert without opting into updates', async ({
  page,
  api,
}) => {
  const alert = await createAlert(api, ['POLICY_VIOLATION']);
  await login(page);
  await openAlert(page, alert.name);
  await expect(
    page.getByRole('checkbox', { name: 'POLICY_VIOLATION', exact: true }),
  ).toBeChecked();
  for (const group of [updateGroup, reviewedGroup]) {
    await expect(
      page.getByRole('checkbox', { name: group, exact: true }),
    ).not.toBeChecked();
  }

  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await page.reload();
  await search(page, alert.name);
  await page.getByRole('cell', { name: alert.name, exact: true }).click();
  const persisted = await readAlert(api, alert);
  expect(persisted.notifyOn).toEqual(['POLICY_VIOLATION']);
  for (const group of [updateGroup, reviewedGroup]) {
    await expect(
      page.getByRole('checkbox', { name: group, exact: true }),
    ).not.toBeChecked();
  }
});

for (const groups of [
  [],
  [updateGroup],
  [reviewedGroup],
  [updateGroup, reviewedGroup],
]) {
  test(`persist independent policy update subscriptions: ${groups.join(', ') || 'none'}`, async ({
    page,
    api,
  }) => {
    const alert = await createAlert(api);
    await login(page);
    await openAlert(page, alert.name);
    const update = page.getByRole('checkbox', {
      name: updateGroup,
      exact: true,
    });
    const reviewed = page.getByRole('checkbox', {
      name: reviewedGroup,
      exact: true,
    });
    await expect(update).not.toBeChecked();
    await expect(reviewed).not.toBeChecked();
    await expect(update).toHaveAccessibleDescription(
      'Notify when the stored message of an existing policy violation changes, excluding approved or suppressed violations. Use a condition that returns a stable message.',
    );
    await expect(reviewed).toHaveAccessibleDescription(
      'Notify when the stored message of an approved or suppressed policy violation changes. Review decisions stay unchanged. Opting in does not replay earlier changes.',
    );
    for (const group of groups) {
      await page.getByRole('checkbox', { name: group, exact: true }).check();
    }
    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/v1/notification/rule') &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    const response = await saved;
    expect(response.ok()).toBe(true);
    expect(response.request().postDataJSON().notifyOn.toSorted()).toEqual(
      groups.toSorted(),
    );
    await expect(page.getByText('Updated', { exact: true })).toBeVisible();

    await page.reload();
    await search(page, alert.name);
    await page.getByRole('cell', { name: alert.name, exact: true }).click();
    for (const group of [updateGroup, reviewedGroup]) {
      await expect(
        page.getByRole('checkbox', { name: group, exact: true }),
      ).toBeChecked({ checked: groups.includes(group) });
    }
    await expect(
      page.getByRole('checkbox', { name: 'POLICY_VIOLATION', exact: true }),
    ).not.toBeChecked();
    const persisted = await readAlert(api, alert);
    expect((persisted.notifyOn || []).toSorted()).toEqual(groups.toSorted());
  });
}

test('retain the event restriction of policy update groups', async ({
  page,
  api,
}) => {
  const publishers = await api.get('/v1/notification/publisher');
  const publisher = publishers.find(
    (candidate) => candidate.name === 'Console',
  );
  const alert = await api.send('PUT', '/v1/notification/rule/scheduled', {
    name: uniqueName('e2e-scheduled-update-alert'),
    scope: 'PORTFOLIO',
    triggerType: 'SCHEDULE',
    scheduleCron: '0 0 * * *',
    notificationLevel: 'INFORMATIONAL',
    publisher: { uuid: publisher.uuid },
    notifyOn: ['NEW_POLICY_VIOLATIONS_SUMMARY'],
  });
  await login(page);
  await openAlert(page, alert.name);
  for (const group of [updateGroup, reviewedGroup]) {
    await expect(
      page.getByRole('checkbox', { name: group, exact: true }),
    ).toHaveCount(0);
  }
  await expect(
    page.getByRole('checkbox', { name: 'NEW_POLICY_VIOLATIONS_SUMMARY' }),
  ).toBeChecked();
});

test('keep policy update groups out of system alerts', async ({
  page,
  api,
}) => {
  const publishers = await api.get('/v1/notification/publisher');
  const publisher = publishers.find(
    (candidate) => candidate.name === 'Console',
  );
  const alert = await api.send('PUT', '/v1/notification/rule', {
    name: uniqueName('e2e-system-update-alert'),
    scope: 'SYSTEM',
    notificationLevel: 'INFORMATIONAL',
    publisher: { uuid: publisher.uuid },
    notifyOn: ['FILE_SYSTEM'],
  });
  await login(page);
  await openAlert(page, alert.name);
  for (const group of [updateGroup, reviewedGroup]) {
    await expect(
      page.getByRole('checkbox', { name: group, exact: true }),
    ).toHaveCount(0);
  }
  await expect(
    page.getByRole('checkbox', { name: 'FILE_SYSTEM', exact: true }),
  ).toBeChecked();
});

test('unsubscribe from both policy update groups', async ({ page, api }) => {
  const alert = await createAlert(api, [updateGroup, reviewedGroup]);
  await login(page);
  await openAlert(page, alert.name);
  for (const group of [updateGroup, reviewedGroup]) {
    const checkbox = page.getByRole('checkbox', { name: group, exact: true });
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
  }
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await page.reload();
  await search(page, alert.name);
  await page.getByRole('cell', { name: alert.name, exact: true }).click();
  const persisted = await readAlert(api, alert);
  expect(persisted.notifyOn || []).toEqual([]);
  for (const group of [updateGroup, reviewedGroup]) {
    await expect(
      page.getByRole('checkbox', { name: group, exact: true }),
    ).not.toBeChecked();
  }
});
