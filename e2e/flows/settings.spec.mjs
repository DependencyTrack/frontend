import { uniqueName } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

const property = { groupName: 'general', propertyName: 'badge.enabled' };

test('change and save a setting that uses a switch', async ({ page, api }) => {
  const original = await badgesEnabled(api);
  // The switch shows off until the config has loaded, so start from on to know when it has.
  await setBadgesEnabled(api, 'true');
  try {
    await login(page);
    await page.goto('admin/configuration/general');
    const label = 'Enable unauthenticated SVG badge access';
    const badges = page.getByLabel(label);
    await expect(badges).toBeChecked();
    // Bootstrap 4's switch label covers its checkbox, so uncheck() can't click it.
    await page.getByText(label).click();
    await expect(badges).not.toBeChecked();
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Configuration saved')).toBeVisible();
    expect(await badgesEnabled(api)).toBe('false');
  } finally {
    await setBadgesEnabled(api, original);
  }
});

test('explain why a risk score weight is invalid', async ({ page }) => {
  await login(page);
  await page.goto('admin/configuration/riskscore');
  const critical = page.getByRole('spinbutton', { name: 'Critical' });
  await critical.fill('11');
  await expect(
    page.getByText('Critical (default: 10) value should be under 10'),
  ).toBeVisible();
  await critical.fill('');
  await expect(
    page.getByText('Critical (default: 10) is required'),
  ).toBeVisible();
});

test('validate only the BOMs of projects with a tag', async ({ page, api }) => {
  const properties = await api.get('/v1/configProperty');
  const original = properties.filter((p) =>
    ['bom.validation.mode', 'bom.validation.tags.inclusive'].includes(
      p.propertyName,
    ),
  );
  const tag = uniqueName('tag');
  try {
    await login(page);
    await page.goto('admin/configuration/bomFormats');
    await page.getByText('Enabled for tags').click();
    await page.getByPlaceholder('Add Tag').first().fill(tag);
    await page.getByPlaceholder('Add Tag').first().press('Enter');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Configuration saved')).toBeVisible();

    await page.reload();
    await expect(page.getByText(tag)).toBeVisible();
    const saved = await api.get('/v1/configProperty');
    expect(
      saved.find((p) => p.propertyName === 'bom.validation.tags.inclusive')
        .propertyValue,
    ).toBe(JSON.stringify([tag]));
  } finally {
    await api.send(
      'POST',
      '/v1/configProperty/aggregate',
      original.map(({ groupName, propertyName, propertyValue }) => ({
        groupName,
        propertyName,
        propertyValue,
      })),
    );
  }
});

async function badgesEnabled(api) {
  const properties = await api.get('/v1/configProperty');
  return properties.find(
    (p) =>
      p.groupName === property.groupName &&
      p.propertyName === property.propertyName,
  ).propertyValue;
}

function setBadgesEnabled(api, value) {
  return api.send('POST', '/v1/configProperty/aggregate', [
    { ...property, propertyValue: value },
  ]);
}
