import { test, expect, login, switchNear, toggleSwitch } from '../test.mjs';

const property = { groupName: 'general', propertyName: 'badge.enabled' };

test('change and save a setting that uses a switch', async ({ page, api }) => {
  const original = await badgesEnabled(api);
  // The switch shows off until the config has loaded, so start from on to know when it has.
  await setBadgesEnabled(api, 'true');
  try {
    await login(page);
    await page.goto('admin/configuration/general');
    const badges = switchNear(page, 'Enable unauthenticated SVG badge access');
    await expect(badges).toBeChecked();
    await toggleSwitch(badges);
    await expect(badges).not.toBeChecked();
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Configuration saved')).toBeVisible();
    expect(await badgesEnabled(api)).toBe('false');
  } finally {
    await setBadgesEnabled(api, original);
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
